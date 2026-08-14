import { getDeliveryFee } from "@/lib/format";
import { inventoryLines, stoppedMilestones, successfulMilestones } from "@/lib/order-lifecycle";
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
  const createdAt = new Date().toISOString();
  const baseOrder = {
    orderId,
    total,
    deliveryFee,
    paymentMethod: request.paymentMethod,
    destinationCity: request.customer.city,
    createdAt,
    items: request.items,
  };

  const unavailableItem = request.items.find((item) => item.availableStock < item.quantity);
  if (request.scenario === "OUT_OF_STOCK" || unavailableItem) {
    trace.push({
      agent: "Catalogue Agent",
      status: "failed",
      message: `${unavailableItem?.name ?? request.items[0]?.name ?? "A cart item"} became unavailable before reservation.`,
      durationMs: 118,
    });
    trace.push({ agent: "Risk Agent", status: "skipped", message: "Order risk rules were not required.", durationMs: 0 });
    trace.push({ agent: "Payment Agent", status: "skipped", message: "Payment was not attempted.", durationMs: 0 });
    trace.push({ agent: "Fulfilment Agent", status: "skipped", message: "Delivery planning was not required.", durationMs: 0 });
    trace.push({ agent: "Delivery Agent", status: "skipped", message: "No delivery journey was created.", durationMs: 0 });
    trace.push({ agent: "Notification Agent", status: "completed", message: "A stock alert was added to the customer order history.", durationMs: 72 });

    return {
      ...baseOrder,
      status: "OUT_OF_STOCK",
      estimatedDelivery: null,
      paymentReference: null,
      deliveryStatus: "NOT_CREATED",
      message: "The order was stopped before payment because an item is out of stock.",
      inventoryDisposition: "REJECTED",
      inventory: inventoryLines(request.items, "REJECTED"),
      milestones: stoppedMilestones(createdAt, "OUT_OF_STOCK", createdAt),
      trace,
    };
  }

  trace.push({
    agent: "Catalogue Agent",
    status: "completed",
    message: `${request.items.length} item type${request.items.length === 1 ? "" : "s"} checked and reserved.`,
    durationMs: 126,
  });
  trace.push({
    agent: "Risk Agent",
    status: "completed",
    message: "Address, order value and payment rules passed the demo risk check.",
    durationMs: 93,
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
    trace.push({
      agent: "Delivery Agent",
      status: "skipped",
      message: "No delivery journey was created.",
      durationMs: 0,
    });
    trace.push({
      agent: "Notification Agent",
      status: "completed",
      message: "A payment-failure update was added to recent orders.",
      durationMs: 69,
    });

    return {
      ...baseOrder,
      status: "PAYMENT_FAILED",
      estimatedDelivery: null,
      paymentReference: null,
      deliveryStatus: "NOT_CREATED",
      message: "Payment could not be authorised. No money was charged.",
      inventoryDisposition: "RELEASED",
      inventory: inventoryLines(request.items, "RELEASED"),
      milestones: stoppedMilestones(createdAt, "PAYMENT_FAILED", createdAt),
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
    message: `Picking and packing planned for ${request.items.length} item type${request.items.length === 1 ? "" : "s"}.`,
    durationMs: 164,
  });
  trace.push({
    agent: "Delivery Agent",
    status: "completed",
    message: `Delivery milestones scheduled for ${request.customer.city} ${request.customer.pincode}.`,
    durationMs: 131,
  });
  trace.push({
    agent: "Notification Agent",
    status: "completed",
    message: "Confirmation and tracking details were added to recent orders.",
    durationMs: 76,
  });

  return {
    ...baseOrder,
    status: "CONFIRMED",
    estimatedDelivery: deliveryDate(),
    paymentReference,
    deliveryStatus: "PROCESSING",
    message: "Your order is confirmed and is being prepared for dispatch.",
    inventoryDisposition: "COMMITTED",
    inventory: inventoryLines(request.items, "COMMITTED"),
    milestones: successfulMilestones(createdAt, "PROCESSING", createdAt),
    trace,
  };
}
