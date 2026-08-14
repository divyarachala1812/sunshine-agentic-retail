import type {
  DeliveryStatus,
  OrderMilestone,
  OrderMilestoneCode,
  OrderRequest,
  OrderResponse,
} from "@/types/commerce";

type MilestoneTemplate = {
  code: OrderMilestoneCode;
  label: string;
  message: string;
  offsetMinutes: number;
};

const templates: MilestoneTemplate[] = [
  { code: "ORDER_RECEIVED", label: "Order received", message: "The order details were validated and recorded.", offsetMinutes: 0 },
  { code: "INVENTORY_RESERVED", label: "Items reserved", message: "Available units were held while payment was reviewed.", offsetMinutes: 1 },
  { code: "PAYMENT_APPROVED", label: "Payment confirmed", message: "The selected payment method was approved.", offsetMinutes: 2 },
  { code: "PICKING", label: "Picking items", message: "The fulfilment team is collecting the order items.", offsetMinutes: 45 },
  { code: "PACKED", label: "Packed", message: "The order was checked, packed and labelled.", offsetMinutes: 180 },
  { code: "SHIPPED", label: "Shipped", message: "The parcel left the fulfilment centre.", offsetMinutes: 360 },
  { code: "OUT_FOR_DELIVERY", label: "Out for delivery", message: "The parcel is with the local delivery partner.", offsetMinutes: 4320 },
  { code: "DELIVERED", label: "Delivered", message: "The parcel reached the delivery address.", offsetMinutes: 4740 },
];

const completedThrough: Record<Exclude<DeliveryStatus, "NOT_CREATED">, number> = {
  PROCESSING: 3,
  SHIPPED: 5,
  OUT_FOR_DELIVERY: 6,
  DELIVERED: 7,
};

function timestamp(createdAt: string, offsetMinutes: number) {
  return new Date(new Date(createdAt).getTime() + offsetMinutes * 60_000).toISOString();
}

export function successfulMilestones(
  createdAt: string,
  deliveryStatus: Exclude<DeliveryStatus, "NOT_CREATED">,
): OrderMilestone[] {
  const currentIndex = completedThrough[deliveryStatus];
  return templates.map((template, index) => ({
    code: template.code,
    label: template.label,
    state:
      deliveryStatus === "DELIVERED" || index < currentIndex
        ? "COMPLETED"
        : index === currentIndex
          ? "CURRENT"
          : "UPCOMING",
    message: template.message,
    occurredAt: index <= currentIndex ? timestamp(createdAt, template.offsetMinutes) : null,
  }));
}

export function stoppedMilestones(
  createdAt: string,
  status: Extract<OrderResponse["status"], "PAYMENT_FAILED" | "OUT_OF_STOCK">,
): OrderMilestone[] {
  const stoppedIndex = status === "OUT_OF_STOCK" ? 1 : 2;
  return templates.map((template, index) => {
    if (index < stoppedIndex) {
      return {
        code: template.code,
        label: template.label,
        state: "COMPLETED",
        message: template.message,
        occurredAt: timestamp(createdAt, template.offsetMinutes),
      };
    }

    const failureMessage =
      status === "OUT_OF_STOCK"
        ? "The requested quantity was no longer available. Payment was not attempted."
        : "Payment was declined. The temporary stock hold was released automatically.";
    return {
      code: template.code,
      label: template.label,
      state: "STOPPED",
      message: index === stoppedIndex ? failureMessage : "This stage was not started.",
      occurredAt: index === stoppedIndex ? timestamp(createdAt, template.offsetMinutes) : null,
    };
  });
}

export function inventoryLines(
  items: OrderRequest["items"],
  disposition: OrderResponse["inventoryDisposition"],
) {
  return items.map((item) => ({
    productId: item.productId,
    name: item.name,
    requested: item.quantity,
    availableBefore: item.availableStock,
    reserved: disposition === "REJECTED" ? 0 : item.quantity,
    availableAfter:
      disposition === "COMMITTED"
        ? Math.max(0, item.availableStock - item.quantity)
        : item.availableStock,
  }));
}
