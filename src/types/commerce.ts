export type CategoryId =
  | "women"
  | "men"
  | "footwear"
  | "electronics"
  | "home";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CategoryId;
  categoryLabel: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  description: string;
  colour: string;
  sizes?: string[];
  badge?: string;
  deliveryDays: number;
  stock: number;
};

export type CartLine = {
  product: Product;
  quantity: number;
  selectedSize?: string;
};

export type OrderScenario = "SUCCESS" | "PAYMENT_FAILED" | "OUT_OF_STOCK";

export type OrderRequest = {
  items: Array<{
    productId: string;
    slug: string;
    name: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    availableStock: number;
  }>;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  paymentMethod: "UPI" | "CARD" | "COD";
  scenario: OrderScenario;
};

export type AgentStep = {
  agent:
    | "Catalogue Agent"
    | "Risk Agent"
    | "Payment Agent"
    | "Fulfilment Agent"
    | "Delivery Agent"
    | "Notification Agent";
  status: "completed" | "failed" | "skipped";
  message: string;
  durationMs: number;
};

export type DeliveryStatus =
  | "PROCESSING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "NOT_CREATED";

export type OrderMilestoneCode =
  | "ORDER_RECEIVED"
  | "INVENTORY_RESERVED"
  | "PAYMENT_APPROVED"
  | "PICKING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export type OrderMilestone = {
  code: OrderMilestoneCode;
  label: string;
  state: "COMPLETED" | "CURRENT" | "UPCOMING" | "STOPPED";
  message: string;
  occurredAt: string | null;
};

export type InventoryDisposition = "COMMITTED" | "RELEASED" | "REJECTED";

export type InventoryLine = {
  productId: string;
  name: string;
  requested: number;
  availableBefore: number;
  reserved: number;
  availableAfter: number;
};

export type OrderResponse = {
  orderId: string;
  status: "CONFIRMED" | "PAYMENT_FAILED" | "OUT_OF_STOCK";
  total: number;
  deliveryFee: number;
  estimatedDelivery: string | null;
  paymentReference: string | null;
  paymentMethod: OrderRequest["paymentMethod"];
  deliveryStatus: DeliveryStatus;
  destinationCity: string;
  createdAt: string;
  items: OrderRequest["items"];
  message: string;
  inventoryDisposition: InventoryDisposition;
  inventory: InventoryLine[];
  milestones: OrderMilestone[];
  trace: AgentStep[];
};
