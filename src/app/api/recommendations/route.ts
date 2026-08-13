import { getProduct, products } from "@/data/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? "";
  const product = getProduct(slug);
  if (!product) return Response.json({ error: "Product not found" }, { status: 404 });

  const pythonBackendUrl = process.env.PYTHON_BACKEND_URL;
  if (pythonBackendUrl) {
    try {
      const candidates = products.filter((candidate) => candidate.category === product.category);
      const response = await fetch(`${pythonBackendUrl.replace(/\/$/, "")}/recommendations`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reference: {
            product_id: product.id,
            slug: product.slug,
            category: product.category,
            price: product.price,
            rating: product.rating,
          },
          candidates: candidates.map((candidate) => ({
            product_id: candidate.id,
            slug: candidate.slug,
            category: candidate.category,
            price: candidate.price,
            rating: candidate.rating,
          })),
          limit: 4,
        }),
        signal: AbortSignal.timeout(3500),
      });
      if (response.ok) {
        const data = (await response.json()) as { product_ids?: string[] };
        const recommended = (data.product_ids ?? [])
          .map((id) => products.find((item) => item.id === id))
          .filter((item) => item !== undefined);
        if (recommended.length) return Response.json({ products: recommended, source: "python" });
      }
    } catch {
      // Fall back to the identical deterministic scoring model for Vercel.
    }
  }

  const ranked = products
    .filter((candidate) => candidate.category === product.category && candidate.id !== product.id)
    .map((candidate) => ({
      product: candidate,
      score: candidate.rating * 2 - Math.abs(candidate.price - product.price) / Math.max(product.price, 1),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ product: item }) => item);

  return Response.json({ products: ranked, source: "fallback" });
}
