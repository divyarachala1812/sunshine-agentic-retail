import type { Metadata } from "next";
import { OrderResult } from "@/components/order-result";

export const metadata: Metadata = { title: "Order result" };

export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <OrderResult orderId={orderId} />;
}
