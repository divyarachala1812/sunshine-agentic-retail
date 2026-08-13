"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { useCommerce } from "@/components/commerce-provider";
import { ProductVisual } from "@/components/product-visual";
import { formatInr, getCartSubtotal, getDeliveryFee } from "@/lib/format";

export function CartPage() {
  const { lines, isReady, updateQuantity, removeItem } = useCart();
  const { getStock } = useCommerce();
  const hasUnavailable = lines.some((line) => getStock(line.product) < line.quantity);
  const subtotal = getCartSubtotal(lines);
  const deliveryFee = getDeliveryFee(subtotal);

  if (!isReady) return <div className="shell loading-panel">Loading your cart…</div>;

  if (!lines.length) {
    return (
      <section className="shell empty-cart">
        <span className="empty-cart-icon"><ShoppingBag size={38} /></span>
        <h1>Your bag is ready for some sunshine.</h1>
        <p>Add a few everyday finds, then return here to place the demo order.</p>
        <Link className="button button-primary" href="/">Start shopping</Link>
      </section>
    );
  }

  return (
    <section className="shell page-section">
      <div className="page-heading">
        <span className="eyebrow">Shopping bag</span>
        <h1>Your cart</h1>
        <p>{lines.reduce((sum, line) => sum + line.quantity, 0)} items selected</p>
      </div>
      <div className="cart-layout">
        <div className="cart-lines">
          {lines.map((line) => (
            <article className="cart-line" key={`${line.product.id}-${line.selectedSize ?? "default"}`}>
              <Link href={`/products/${line.product.slug}`}><ProductVisual product={line.product} /></Link>
              <div className="cart-line-copy">
                <span className="product-brand">{line.product.brand}</span>
                <Link href={`/products/${line.product.slug}`}><h3>{line.product.name}</h3></Link>
                {line.selectedSize && <p>Size: <strong>{line.selectedSize}</strong></p>}
                <p>{line.product.colour}</p>
                {getStock(line.product) < line.quantity && <p className="cart-stock-alert">This quantity is no longer available. Remove it or try checkout to see the Catalogue Agent stop the order.</p>}
                <div className="quantity-row">
                  <button aria-label={`Decrease ${line.product.name} quantity`} onClick={() => updateQuantity(line.product.id, line.quantity - 1, line.selectedSize)} type="button"><Minus size={15} /></button>
                  <span>{line.quantity}</span>
                  <button aria-label={`Increase ${line.product.name} quantity`} onClick={() => updateQuantity(line.product.id, line.quantity + 1, line.selectedSize)} type="button"><Plus size={15} /></button>
                  <button className="remove-button" onClick={() => removeItem(line.product.id, line.selectedSize)} type="button"><Trash2 size={15} /> Remove</button>
                </div>
              </div>
              <strong className="cart-line-price">{formatInr(line.product.price * line.quantity)}</strong>
            </article>
          ))}
        </div>
        <aside className="order-summary">
          <h2>Price details</h2>
          <dl>
            <div><dt>Subtotal</dt><dd>{formatInr(subtotal)}</dd></div>
            <div><dt>Delivery</dt><dd>{deliveryFee ? formatInr(deliveryFee) : <span className="free-label">FREE</span>}</dd></div>
            <div className="summary-total"><dt>Total amount</dt><dd>{formatInr(subtotal + deliveryFee)}</dd></div>
          </dl>
          {deliveryFee > 0 && <p className="summary-hint">Add {formatInr(999 - subtotal)} more for free delivery.</p>}
          <Link className="button button-primary checkout-button" href="/checkout">{hasUnavailable ? "Review availability at checkout" : "Proceed to checkout"}</Link>
          <p className="safe-note"><ShieldMark /> Simulated payment—no money is charged.</p>
        </aside>
      </div>
    </section>
  );
}

function ShieldMark() {
  return <span aria-hidden="true">✓</span>;
}
