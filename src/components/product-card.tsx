"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { useCommerce } from "@/components/commerce-provider";
import { ProductVisual } from "@/components/product-visual";
import { discountPercent, formatInr } from "@/lib/format";
import type { Product } from "@/types/commerce";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { getStock } = useCommerce();
  const stock = getStock(product);
  const [added, setAdded] = useState(false);
  const defaultSize = product.sizes?.[0];

  const handleAdd = () => {
    if (stock === 0) return;
    addItem(product, defaultSize);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article className="product-card">
      <Link className="product-card-visual" href={`/products/${product.slug}`}>
        {product.badge && <span className="product-badge">{product.badge}</span>}
        {stock <= 3 && <span className={`inventory-badge ${stock === 0 ? "inventory-out" : ""}`}>{stock === 0 ? "Out of stock" : `Only ${stock} left`}</span>}
        <button className="wish-button" aria-label={`Save ${product.name}`} type="button" onClick={(event) => event.preventDefault()}>
          <Heart size={18} />
        </button>
        <ProductVisual product={product} />
      </Link>
      <div className="product-card-body">
        <span className="product-brand">{product.brand}</span>
        <Link href={`/products/${product.slug}`}><h3>{product.name}</h3></Link>
        <div className="rating-line">
          <span><Star size={13} fill="currentColor" /> {product.rating}</span>
          <small>{product.reviews.toLocaleString("en-IN")} reviews</small>
        </div>
        <div className="price-line">
          <strong>{formatInr(product.price)}</strong>
          <del>{formatInr(product.mrp)}</del>
          <span>{discountPercent(product.price, product.mrp)}% off</span>
        </div>
        <p className="delivery-note">{product.price >= 999 ? "Free delivery" : "Delivery ₹79"} · {product.deliveryDays} to {product.deliveryDays + 2} days</p>
        <button className="add-button" disabled={stock === 0} type="button" onClick={handleAdd}>
          <ShoppingBag size={17} /> {stock === 0 ? "Unavailable" : added ? "Added to cart" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
