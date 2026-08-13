"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Landmark, PackageCheck, Smartphone } from "lucide-react";
import { FormEvent, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { useCommerce } from "@/components/commerce-provider";
import { formatInr, getCartSubtotal, getDeliveryFee } from "@/lib/format";
import type { OrderRequest, OrderResponse, OrderScenario } from "@/types/commerce";

export function CheckoutForm() {
  const router = useRouter();
  const { lines, isReady, clearCart } = useCart();
  const { consumeStock, getStock, markUnavailable, saveOrder } = useCommerce();
  const [paymentMethod, setPaymentMethod] = useState<OrderRequest["paymentMethod"]>("UPI");
  const [scenario, setScenario] = useState<OrderScenario>("SUCCESS");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const subtotal = getCartSubtotal(lines);
  const deliveryFee = getDeliveryFee(subtotal);

  if (!isReady) return <div className="shell loading-panel">Preparing checkout…</div>;

  if (!lines.length) {
    return (
      <section className="shell empty-cart compact-empty">
        <h1>Your cart is empty.</h1>
        <p>Add a product before starting checkout.</p>
        <Link className="button button-primary" href="/">Browse products</Link>
      </section>
    );
  }

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const request: OrderRequest = {
      items: lines.map((line) => ({
        productId: line.product.id,
        slug: line.product.slug,
        name: line.product.name,
        price: line.product.price,
        quantity: line.quantity,
        selectedSize: line.selectedSize,
        availableStock: getStock(line.product),
      })),
      customer: {
        name: String(form.get("name")),
        phone: String(form.get("phone")),
        address: String(form.get("address")),
        city: String(form.get("city")),
        pincode: String(form.get("pincode")),
      },
      paymentMethod,
      scenario,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request),
      });
      const result = (await response.json()) as OrderResponse & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Order could not be processed");
      saveOrder(result);
      if (result.status === "CONFIRMED") {
        consumeStock(request.items);
        clearCart();
      } else if (result.status === "OUT_OF_STOCK") {
        const unavailableItems = request.items.filter(
          (item) => item.availableStock < item.quantity,
        );
        (unavailableItems.length ? unavailableItems : request.items.slice(0, 1)).forEach(
          (item) => markUnavailable(item.productId),
        );
      }
      router.push(`/order/${result.orderId}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Order could not be processed");
      setIsSubmitting(false);
    }
  };

  return (
    <section className="shell page-section">
      <div className="page-heading checkout-heading">
        <span className="eyebrow">Secure demo checkout</span>
        <h1>Where should we send it?</h1>
        <p>Use sample information only. Sunshine does not save your details.</p>
      </div>
      <form className="checkout-layout" onSubmit={submitOrder}>
        <div className="checkout-forms">
          <section className="form-card">
            <div className="form-card-heading"><span>1</span><div><h2>Delivery address</h2><p>Indian PIN codes are supported in this demo.</p></div></div>
            <div className="field-grid">
              <label>Full name<input name="name" defaultValue="Divya Rachala" required /></label>
              <label>Mobile number<input name="phone" inputMode="numeric" pattern="[6-9][0-9]{9}" defaultValue="9876543210" required /></label>
              <label className="field-wide">Address<textarea name="address" defaultValue="12, Sunshine Residency, Madhapur" required rows={3} /></label>
              <label>City<input name="city" defaultValue="Hyderabad" required /></label>
              <label>PIN code<input name="pincode" inputMode="numeric" pattern="[1-9][0-9]{5}" defaultValue="500081" required /></label>
            </div>
          </section>

          <section className="form-card">
            <div className="form-card-heading"><span>2</span><div><h2>Payment method</h2><p>No real payment gateway is connected.</p></div></div>
            <div className="payment-options">
              <label className={paymentMethod === "UPI" ? "selected" : ""}><input checked={paymentMethod === "UPI"} name="payment" onChange={() => setPaymentMethod("UPI")} type="radio" /><Smartphone size={20} /><span><strong>UPI</strong>Google Pay, PhonePe or any UPI app</span></label>
              <label className={paymentMethod === "CARD" ? "selected" : ""}><input checked={paymentMethod === "CARD"} name="payment" onChange={() => setPaymentMethod("CARD")} type="radio" /><CreditCard size={20} /><span><strong>Card</strong>Credit or debit card simulation</span></label>
              <label className={paymentMethod === "COD" ? "selected" : ""}><input checked={paymentMethod === "COD"} name="payment" onChange={() => setPaymentMethod("COD")} type="radio" /><Landmark size={20} /><span><strong>Cash on delivery</strong>Pay when your order arrives</span></label>
            </div>
          </section>

          <section className="form-card scenario-card">
            <div className="form-card-heading"><span>3</span><div><h2>Demo checkout result</h2><p>Choose a result to preview customer-facing success and failure states.</p></div></div>
            <label>Demo result
              <select value={scenario} onChange={(event) => setScenario(event.target.value as OrderScenario)}>
                <option value="SUCCESS">Successful order</option>
                <option value="PAYMENT_FAILED">Payment declined</option>
                <option value="OUT_OF_STOCK">Item became unavailable</option>
              </select>
            </label>
          </section>
          {error && <p className="form-error" role="alert">{error}</p>}
        </div>

        <aside className="order-summary checkout-summary">
          <h2>Order summary</h2>
          <div className="checkout-items">
            {lines.map((line) => (
              <div key={`${line.product.id}-${line.selectedSize ?? "default"}`}>
                <span>{line.quantity} item of {line.product.name}</span>
                <strong>{formatInr(line.product.price * line.quantity)}</strong>
              </div>
            ))}
          </div>
          <dl>
            <div><dt>Subtotal</dt><dd>{formatInr(subtotal)}</dd></div>
            <div><dt>Delivery</dt><dd>{deliveryFee ? formatInr(deliveryFee) : <span className="free-label">FREE</span>}</dd></div>
            <div className="summary-total"><dt>Payable</dt><dd>{formatInr(subtotal + deliveryFee)}</dd></div>
          </dl>
          <button className="button button-primary checkout-button" disabled={isSubmitting} type="submit">
            <PackageCheck size={19} /> {isSubmitting ? "Processing your order…" : "Place demo order"}
          </button>
          <p className="safe-note"><span>✓</span> By placing this demo order, no payment is made.</p>
        </aside>
      </form>
    </section>
  );
}
