"use client";

import Link from "next/link";
import { Check, CircleAlert, Clock3, PackageCheck, RotateCcw, X } from "lucide-react";
import { useCommerce } from "@/components/commerce-provider";
import { formatInr } from "@/lib/format";
import type { OrderMilestone, OrderResponse } from "@/types/commerce";

const inventoryMessage: Record<OrderResponse["inventoryDisposition"], string> = {
  COMMITTED: "The reserved units were assigned to this confirmed order and deducted from available stock.",
  RELEASED: "The temporary stock hold was released after payment failed. Available stock was not reduced.",
  REJECTED: "No stock was reserved and payment was not attempted.",
};

function milestoneIcon(milestone: OrderMilestone) {
  if (milestone.state === "COMPLETED") return <Check size={17} />;
  if (milestone.state === "CURRENT") return <Clock3 size={17} />;
  if (milestone.state === "STOPPED") return <X size={17} />;
  return <span className="milestone-dot" />;
}

function eventTime(occurredAt: string | null) {
  if (!occurredAt) return "Waiting";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(occurredAt));
}

export function OrderResult({ orderId }: { orderId: string }) {
  const { findOrder } = useCommerce();
  const order = findOrder(orderId);

  if (!order) {
    return (
      <section className="shell empty-cart compact-empty">
        <h1>Order details are not available.</h1>
        <p>This order is not in the public examples or this browser&apos;s order history.</p>
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
        <div className="order-story">
          <section className="order-progress-panel">
            <div className="section-heading">
              <div><span className="eyebrow">Order journey</span><h2>{confirmed ? "From checkout to your doorstep" : "The order stopped safely"}</h2><p>{confirmed ? "Every confirmed order follows the same inventory, payment, fulfilment and delivery path." : "The timeline shows where processing stopped and which later stages were prevented."}</p></div>
            </div>
            <ol className="customer-timeline">
              {order.milestones.map((milestone) => (
                <li className={`milestone-${milestone.state.toLowerCase()}`} key={milestone.code}>
                  <span className="milestone-icon">{milestoneIcon(milestone)}</span>
                  <div>
                    <div className="milestone-heading"><strong>{milestone.label}</strong><time>{eventTime(milestone.occurredAt)}</time></div>
                    <p>{milestone.message}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={`inventory-result inventory-${order.inventoryDisposition.toLowerCase()}`}>
            <div><span className="eyebrow">Inventory result</span><h2>{order.inventoryDisposition === "COMMITTED" ? "Stock committed to the order" : order.inventoryDisposition === "RELEASED" ? "Reservation released" : "Reservation rejected"}</h2><p>{inventoryMessage[order.inventoryDisposition]}</p></div>
            <div className="inventory-lines">
              {order.inventory.map((line) => (
                <article key={line.productId}>
                  <strong>{line.name}</strong>
                  <dl>
                    <div><dt>Before</dt><dd>{line.availableBefore}</dd></div>
                    <div><dt>Held</dt><dd>{line.reserved}</dd></div>
                    <div><dt>After</dt><dd>{line.availableAfter}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          </section>
        </div>

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
