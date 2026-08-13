import { Headphones, House, Laptop, Shirt, ShoppingBag, Smartphone } from "lucide-react";
import type { Product } from "@/types/commerce";

export function ProductVisual({ product, large = false }: { product: Product; large?: boolean }) {
  const name = product.name.toLowerCase();
  const Icon =
    product.category === "women" || product.category === "men"
      ? Shirt
      : product.category === "footwear"
        ? ShoppingBag
        : product.category === "home"
          ? House
          : name.includes("phone") || name.includes("watch") || name.includes("power")
            ? Smartphone
            : name.includes("ear") || name.includes("speaker")
              ? Headphones
              : Laptop;

  return (
    <div
      className={`product-visual product-visual-${product.category}${large ? " product-visual-large" : ""}`}
      aria-label={`${product.name} illustration`}
    >
      <span className="visual-orb visual-orb-one" />
      <span className="visual-orb visual-orb-two" />
      <Icon size={large ? 104 : 72} strokeWidth={1.15} aria-hidden="true" />
      <span className="visual-label">{product.brand}</span>
    </div>
  );
}
