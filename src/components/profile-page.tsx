"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, MapPin, RotateCcw, Truck, UserRound } from "lucide-react";
import { useCommerce } from "@/components/commerce-provider";
import { formatInr } from "@/lib/format";
import type { OrderResponse } from "@/types/commerce";

const statusLabel: Record<OrderResponse["deliveryStatus"], string> = {
  PROCESSING: "Preparing order",
  SHIPPED: "Shipment arriving",
  OUT_FOR_DELIVERY: "Arriving today",
  DELIVERED: "Delivered",
  NOT_CREATED: "Shipment not created",
};

function StatusIcon({ order }: { order: OrderResponse }) {
  if (order.status === "PAYMENT_FAILED" || order.status === "OUT_OF_STOCK") return <AlertTriangle size={20} />;
  if (order.deliveryStatus === "DELIVERED") return <CheckCircle2 size={20} />;
  if (order.deliveryStatus === "SHIPPED" || order.deliveryStatus === "OUT_FOR_DELIVERY") return <Truck size={20} />;
  return <Clock3 size={20} />;
}

export function ProfilePage() {
  const { orders, resetDemoActivity } = useCommerce();
  const personalCount = orders.filter((order) => !order.orderId.startsWith("SUN-DEMO")).length;

  return (
    <section className="shell profile-page" id="profile">
      <div className="profile-hero">
        <span className="profile-avatar"><UserRound size={34} /></span>
        <div><span className="eyebrow">Sunshine profile</span><h1>Hi, Divya.</h1><p>Your recent order states in one place. Orders you place are stored only in this browser.</p></div>
      </div>

      <div className="profile-grid">
        <aside className="profile-sidebar">
          <section><h2>Profile details</h2><dl><div><dt>Name</dt><dd>Divya Rachala</dd></div><div><dt>Delivery city</dt><dd><MapPin size={14} /> Hyderabad</dd></div><div><dt>Member tier</dt><dd>Sunshine Demo</dd></div></dl></section>
          <section className="profile-note"><strong>How persistence works</strong><p>The five examples below are visible to every visitor. Your own completed attempts stay private in local browser storage and appear first.</p></section>
          {personalCount > 0 && <button className="reset-button" onClick={resetDemoActivity} type="button"><RotateCcw size={15} /> Reset my demo activity</button>}
        </aside>

        <div className="orders-panel" id="orders">
          <div className="orders-heading"><div><span className="eyebrow">Order centre</span><h2>Recent orders</h2></div><span>{personalCount} placed in this browser</span></div>
          <div className="orders-list">
            {orders.map((order) => {
              const failed = order.status !== "CONFIRMED";
              return (
                <article className={`order-card ${failed ? "order-card-problem" : ""}`} key={order.orderId}>
                  <div className="order-card-head">
                    <div className={`order-status-icon ${failed ? "status-problem" : ""}`}><StatusIcon order={order} /></div>
                    <div><span className="order-kicker">{order.orderId.startsWith("SUN-DEMO") ? "Public example" : "Your demo order"}</span><h3>{failed ? (order.status === "PAYMENT_FAILED" ? "Payment failed" : "Item unavailable") : statusLabel[order.deliveryStatus]}</h3><p>{order.message}</p></div>
                    <span className="order-total">{formatInr(order.total)}</span>
                  </div>
                  <div className="order-products">
                    {order.items.map((item) => <Link href={`/products/${item.slug}`} key={`${order.orderId}-${item.productId}`}>{item.quantity} item of {item.name}{item.selectedSize ? ` · Size ${item.selectedSize}` : ""}</Link>)}
                  </div>
                  <div className="order-card-foot">
                    <span>{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(order.createdAt))} · {order.paymentMethod}</span>
                    <Link className="text-link" href={`/order/${order.orderId}`}>View order details</Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
