import { describe, expect, it } from "vitest";
import { getProductSearchSuggestions } from "@/lib/product-search";

describe("product search suggestions", () => {
  it("ranks a matching product name first", () => {
    const results = getProductSearchSuggestions("nova 5g");

    expect(results[0]?.name).toBe("Nova 5G Smartphone");
  });

  it("matches useful catalogue words across product names and categories", () => {
    const results = getProductSearchSuggestions("laptop");

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((product) => product.name.toLowerCase().includes("laptop"))).toBe(true);
  });

  it("returns no suggestions for an unmatched query", () => {
    expect(getProductSearchSuggestions("quantum toaster spaceship")).toEqual([]);
  });
});
