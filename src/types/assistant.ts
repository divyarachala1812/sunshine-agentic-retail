import type { OrderResponse, Product } from "@/types/commerce";

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AssistantCartItem = {
  productId: string;
  name: string;
  quantity: number;
  selectedSize?: string;
};

export type AssistantInventoryItem = {
  productId: string;
  availableStock: number;
};

export type AssistantRequest = {
  messages: AssistantMessage[];
  orders: OrderResponse[];
  cart: AssistantCartItem[];
  inventory: AssistantInventoryItem[];
};

export type AssistantAction = {
  label: string;
  href: string;
  kind: "cart" | "checkout" | "order" | "profile" | "help";
};

export type AssistantReply = {
  message: string;
  products: Product[];
  suggestedSize?: string;
  quickReplies: string[];
  actions: AssistantAction[];
  source: "ollama" | "sunshine";
};

export type AssistantIntent =
  | { kind: "search_products"; query: string; audience?: string; style?: string; size?: string; maxPrice?: number }
  | { kind: "lookup_order"; orderId: string }
  | { kind: "list_orders" }
  | { kind: "view_cart" }
  | { kind: "checkout" }
  | { kind: "help" };
