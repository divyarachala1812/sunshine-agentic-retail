"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/types/commerce";

export function Recommendations({ slug, fallback }: { slug: string; fallback: Product[] }) {
  const [items, setItems] = useState(fallback);
  const [source, setSource] = useState<"python" | "fallback">("fallback");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/recommendations?slug=${encodeURIComponent(slug)}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { products?: Product[]; source?: "python" | "fallback" }) => {
        if (data.products?.length) setItems(data.products);
        if (data.source) setSource(data.source);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [slug]);

  return (
    <section className="shell section-block recommendations" aria-labelledby="recommendations-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Python recommendation service</span>
          <h2 id="recommendations-title">You may also like</h2>
          <p>
            Ranked using category, price proximity and rating
            {source === "fallback" ? " through the Vercel-compatible adapter" : " by FastAPI"}.
          </p>
        </div>
      </div>
      <div className="product-grid product-grid-four">
        {items.slice(0, 4).map((product) => <ProductCard product={product} key={product.id} />)}
      </div>
    </section>
  );
}
