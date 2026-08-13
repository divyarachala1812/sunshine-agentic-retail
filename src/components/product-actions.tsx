"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Zap } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { useCommerce } from "@/components/commerce-provider";
import type { Product } from "@/types/commerce";

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { getStock } = useCommerce();
  const stock = getStock(product);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]);
  const [added, setAdded] = useState(false);

  const add = () => {
    if (stock === 0) return;
    addItem(product, selectedSize);
    setAdded(true);
  };

  const buyNow = () => {
    if (stock === 0) return;
    addItem(product, selectedSize);
    router.push("/checkout");
  };

  return (
    <div className="product-actions">
      <p className={`stock-message ${stock === 0 ? "stock-out" : stock <= 3 ? "stock-low" : ""}`}>
        {stock === 0 ? "Currently unavailable — this item cannot be added" : stock <= 3 ? `Only ${stock} left — order soon` : `${stock} units available`}
      </p>
      {product.sizes && (
        <fieldset className="size-picker">
          <legend>Select size</legend>
          <div>
            {product.sizes.map((size) => (
              <button
                aria-pressed={size === selectedSize}
                className={size === selectedSize ? "selected" : ""}
                key={size}
                onClick={() => setSelectedSize(size)}
                type="button"
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <div className="product-action-buttons">
        <button className="button button-secondary" disabled={stock === 0} onClick={add} type="button">
          <ShoppingBag size={19} /> {added ? "Added to cart" : "Add to cart"}
        </button>
        <button className="button button-primary" disabled={stock === 0} onClick={buyNow} type="button">
          <Zap size={19} /> Buy now
        </button>
      </div>
    </div>
  );
}
