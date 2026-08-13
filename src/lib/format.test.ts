import { describe, expect, it } from "vitest";
import { discountPercent, getCartSubtotal, getDeliveryFee } from "@/lib/format";

describe("retail calculations", () => {
  it("unlocks free delivery at ₹999", () => {
    expect(getDeliveryFee(998)).toBe(79);
    expect(getDeliveryFee(999)).toBe(0);
  });

  it("calculates a weighted cart subtotal", () => {
    expect(
      getCartSubtotal([
        { product: { price: 499 }, quantity: 2 },
        { product: { price: 1499 }, quantity: 1 },
      ]),
    ).toBe(2497);
  });

  it("returns the nearest whole discount percent", () => {
    expect(discountPercent(1499, 2999)).toBe(50);
  });
});
