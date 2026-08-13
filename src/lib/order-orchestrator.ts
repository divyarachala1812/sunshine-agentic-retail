import { getDeliveryFee } from "@/lib/format";
import type { AgentStep, OrderRequest, OrderResponse } from "@/types/commerce";

const makeReference = (prefix: string) => {
  const stamp = Date.now().toString().slice(-8);
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${stamp}${random}`;
};

const deliveryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 4);
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
};

export function orchestrateOrder(request: OrderRequest): OrderResponse {
  const subtotal = request.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const deliveryFee = getDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;
  const trace: AgentStep[] = [];
  const orderId = makeReference("SUN");

  if (request.scenario === "OUT_OF_STOCK") {
    trace.push({
      agent: "Catalogue Agent",
      status: "failed",
      message: "One cart item became unavailable before reservation.",
      durationMs: 118,
    });
    trace.push({ agent: "Payment Agent", status: "skipped", message: "Payment was not attempted.", durationMs: 0 });
    trace.push({ agent: "Fulfilment Agent", status: "skipped", message: "Delivery planning was not required.", durationMs: 0 });

    return {
      orderId,
      status: "OUT_OF_STOCK",
      total,
      deliveryFee,
      estimatedDelivery: null,
      paymentReference: null,
      message: "The order was stopped before payment because an item is out of stock.",
      trace,
    };
  }

  trace.push({
    agent: "Catalogue Agent",
    status: "completed",
    message: `${request.items.length} item type${request.items.length === 1 ? "" : "s"} checked and reserved.`,
    durationMs: 126,
  });

  if (request.scenario === "PAYMENT_FAILED") {
    trace.push({
      agent: "Payment Agent",
      status: "failed",
      message: `${request.paymentMethod} authorisation was declined in the demo scenario.`,
      durationMs: 284,
    });
    trace.push({
      agent: "Fulfilment Agent",
      status: "skipped",
      message: "Reserved stock was released; delivery was not booked.",
      durationMs: 0,
    });

    return {
      orderId,
      status: "PAYMENT_FAILED",
      total,
      deliveryFee,
      estimatedDelivery: null,
      paymentReference: null,
      message: "Payment could not be authorised. No money was charged.",
      trace,
    };
  }

  const paymentReference = makeReference(request.paymentMethod);
  trace.push({
    agent: "Payment Agent",
    status: "completed",
    message:
      request.paymentMethod === "COD"
        ? "Cash on delivery eligibility confirmed."
        : `${request.paymentMethod} payment authorised securely.`,
    durationMs: 242,
  });
  trace.push({
    agent: "Fulfilment Agent",
    status: "completed",
    message: `Shipment planned for ${request.customer.city} ${request.customer.pincode}.`,
    durationMs: 164,
  });

  return {
    orderId,
    status: "CONFIRMED",
    total,
    deliveryFee,
    estimatedDelivery: deliveryDate(),
    paymentReference,
    message: "Your order is confirmed and is being prepared for dispatch.",
    trace,
  };
}
