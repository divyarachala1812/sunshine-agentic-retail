import { House, Laptop, Shirt, ShoppingBag, Sparkles } from "lucide-react";
import type { CategoryId } from "@/types/commerce";

const icons = {
  women: Sparkles,
  men: Shirt,
  footwear: ShoppingBag,
  electronics: Laptop,
  home: House,
};

export function CategoryArtwork({ category }: { category: CategoryId }) {
  const Icon = icons[category];
  return (
    <span className={`category-artwork category-artwork-${category}`} aria-hidden="true">
      <Icon size={35} strokeWidth={1.5} />
    </span>
  );
}
