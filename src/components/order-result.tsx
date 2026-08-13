"use client";

import Link from "next/link";
import { Check, CircleAlert, PackageCheck, RotateCcw, X } from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";
import { formatInr } from "@/lib/format";
import type { OrderResponse } from "@/types/commerce";

export function OrderResult({ orderId }: { orderId: string }) {
  const storageKey = `sunshine-order-${orderId}`;
  const savedOrder = useSyncExternalStore(
    () => () => undefined,
    () => window.sessionStorage.getItem(storageKey),
    () => null,
  );
  const order = useMemo(
    () => (savedOrder ? (JSON.parse(savedOrder) as OrderResponse) : null),
    [savedOrder],
  );

  if (!order) {
    return (
      <section className="shell empty-cart compact-empty">
        <h1>Order details are not available.</h1>
        <p>This demo keeps order results only in the current browser session.</p>
        <Link className="button button-primary" href="/">Back to Sunshine</Link>
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

      <div className="shell order-content">
        <section className="trace-panel">
          <div className="section-heading">
            <div><span className="eyebrow">Java agent orchestration</span><h2>What happened behind the order</h2><p>Each bounded agent completed one retail responsibility and passed control forward.</p></div>
          </div>
          <ol className="agent-trace">
            {order.trace.map((step, index) => (
              <li className={`trace-step trace-${step.status}`} key={step.agent}>
                <span className="trace-index">{step.status === "completed" ? <Check size={18} /> : step.status === "failed" ? <X size={18} /> : index + 1}</span>
                <div><strong>{step.agent}</strong><p>{step.message}</p></div>
                <small>{step.durationMs ? `${step.durationMs} ms` : "Not run"}</small>
              </li>
            ))}
          </ol>
        </section>
        <aside className="order-receipt">
          <h2>Order details</h2>
          <dl>
            <div><dt>Order number</dt><dd>{order.orderId}</dd></div>
            <div><dt>Status</dt><dd>{order.status.replaceAll("_", " ")}</dd></div>
            <div><dt>Delivery fee</dt><dd>{order.deliveryFee ? formatInr(order.deliveryFee) : "FREE"}</dd></div>
            <div><dt>Order total</dt><dd>{formatInr(order.total)}</dd></div>
            {order.paymentReference && <div><dt>Payment reference</dt><dd>{order.paymentReference}</dd></div>}
          </dl>
          <Link className="button button-primary checkout-button" href={confirmed ? "/" : "/checkout"}>{confirmed ? "Continue shopping" : <><RotateCcw size={17} /> Try again</>}</Link>
        </aside>
      </div>
    </section>
  );
}
