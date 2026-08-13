"use client";

import Link from "next/link";
import { Check, CircleAlert, PackageCheck, RotateCcw, X } from "lucide-react";
import { useCommerce } from "@/components/commerce-provider";
import { formatInr } from "@/lib/format";
import type { OrderResponse } from "@/types/commerce";

export function OrderResult({ orderId }: { orderId: string }) {
  const { findOrder } = useCommerce();
  const order: OrderResponse | undefined = findOrder(orderId);

  if (!order) {
    return (
      <section className="shell empty-cart compact-empty">
        <h1>Order details are not available.</h1>
        <p>This order is not in the public examples or this browser’s order history.</p>
        <Link className="button button-primary" href="/profile">View recent orders</Link>
      </section>
    );
  }

  const confirmed = order.status === "CONFIRMED";

  return (
    <section className="order-page">
      <div className={`order-hero ${confirmed ? "order-hero-success" : "order-hero-failed"}`}>
        <div className="shell order-hero-inner">
          <span className="order-result-icon">{confirmed ? <PackageCheck size={38} /> : <CircleAlert size={38} />}</span>
          <span className="eyebrow">Order {order.orderId}</span>
          <h1>{confirmed ? "Order confirmed." : order.status === "PAYMENT_FAILED" ? "Payment was declined." : "An item is unavailable."}</h1>
          <p>{order.message}</p>
          {confirmed && <div className="delivery-date"><span>Estimated delivery</span><strong>{order.estimatedDelivery}</strong></div>}
        </div>
      </div>

      <div className="shell order-content customer-order-content">
        <section className="order-progress-panel">
          <div className="section-heading">
            <div><span className="eyebrow">Order progress</span><h2>{confirmed ? "Your order is being prepared" : "We stopped the order safely"}</h2><p>{confirmed ? "We confirmed your items, payment and delivery details." : "No shipment was created. Review the explanation below before trying again."}</p></div>
          </div>
          <div className="customer-progress">
            <div className={order.status === "OUT_OF_STOCK" ? "progress-problem" : "progress-complete"}><span>{order.status === "OUT_OF_STOCK" ? <X size={18} /> : <Check size={18} />}</span><div><strong>Items checked</strong><p>{order.status === "OUT_OF_STOCK" ? "One item was no longer available." : "Your selected items were available."}</p></div></div>
            <div className={order.status === "PAYMENT_FAILED" ? "progress-problem" : order.status === "CONFIRMED" ? "progress-complete" : "progress-muted"}><span>{order.status === "PAYMENT_FAILED" ? <X size={18} /> : order.status === "CONFIRMED" ? <Check size={18} /> : 2}</span><div><strong>Payment reviewed</strong><p>{order.status === "PAYMENT_FAILED" ? "The payment was declined and no money was charged." : order.status === "CONFIRMED" ? `${order.paymentMethod} was confirmed.` : "Payment was not attempted."}</p></div></div>
            <div className={confirmed ? "progress-complete" : "progress-muted"}><span>{confirmed ? <Check size={18} /> : 3}</span><div><strong>Delivery update</strong><p>{confirmed ? order.estimatedDelivery : "No shipment was created."}</p></div></div>
          </div>
        </section>
        <aside className="order-receipt">
          <h2>Order details</h2>
          <dl>
            <div><dt>Order number</dt><dd>{order.orderId}</dd></div>
            <div><dt>Status</dt><dd>{order.status.replaceAll("_", " ")}</dd></div>
            <div><dt>Delivery</dt><dd>{order.deliveryStatus.replaceAll("_", " ")}</dd></div>
            <div><dt>Payment</dt><dd>{order.paymentMethod}</dd></div>
            <div><dt>Delivery fee</dt><dd>{order.deliveryFee ? formatInr(order.deliveryFee) : "FREE"}</dd></div>
            <div><dt>Order total</dt><dd>{formatInr(order.total)}</dd></div>
            {order.paymentReference && <div><dt>Payment reference</dt><dd>{order.paymentReference}</dd></div>}
          </dl>
          <Link className="button button-primary checkout-button" href="/profile">View recent orders</Link>
          <button className="text-link receipt-link assistant-order-help" data-open-assistant type="button">Ask Divya about this order</button>
          {!confirmed && <Link className="text-link receipt-link" href="/checkout"><RotateCcw size={15} /> Try checkout again</Link>}
        </aside>
      </div>
    </section>
  );
}
