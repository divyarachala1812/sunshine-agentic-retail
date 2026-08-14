import { products } from "@/data/products";
import type { Product } from "@/types/commerce";

const normalise = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const searchDocument = (product: Product) =>
  normalise([product.name, product.brand, product.categoryLabel].join(" "));

export function getProductSearchSuggestions(query: string, limit = 6) {
  const normalisedQuery = normalise(query);
  if (!normalisedQuery) return [];

  const terms = normalisedQuery.split(" ");

  return products
    .map((product) => {
      const name = normalise(product.name);
      const brand = normalise(product.brand);
      const document = searchDocument(product);
      if (!terms.every((term) => document.includes(term))) return null;

      const score =
        name === normalisedQuery
          ? 0
          : name.startsWith(normalisedQuery)
            ? 1
            : name.includes(normalisedQuery)
              ? 2
              : brand.startsWith(normalisedQuery)
                ? 3
                : 4;

      return { product, score };
    })
    .filter((entry): entry is { product: Product; score: number } => entry !== null)
    .sort((left, right) =>
      left.score - right.score ||
      right.product.rating - left.product.rating ||
      left.product.name.localeCompare(right.product.name),
    )
    .slice(0, limit)
    .map(({ product }) => product);
}
