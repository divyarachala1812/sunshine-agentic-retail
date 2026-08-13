import { describe, expect, it } from "vitest";
import { orchestrateOrder } from "@/lib/order-orchestrator";
import type { OrderRequest, OrderScenario } from "@/types/commerce";

const request = (scenario: OrderScenario): OrderRequest => ({
  items: [{ productId: "WO-001", slug: "anvi-aarohi-floral-kurta-set", name: "Aarohi Floral Kurta Set", price: 1499, quantity: 1, selectedSize: "S", availableStock: 1 }],
  customer: {
    name: "Divya Rachala",
    phone: "9876543210",
    address: "Madhapur",
    city: "Hyderabad",
    pincode: "500081",
  },
  paymentMethod: "UPI",
  scenario,
});

describe("Vercel order adapter", () => {
  it("runs all agents for a confirmed order", () => {
    const result = orchestrateOrder(request("SUCCESS"));
    expect(result.status).toBe("CONFIRMED");
    expect(result.trace.map((step) => step.status)).toEqual([
      "completed",
      "completed",
      "completed",
      "completed",
      "completed",
    ]);
    expect(result.deliveryStatus).toBe("PROCESSING");
    expect(result.items[0].slug).toBe("anvi-aarohi-floral-kurta-set");
  });

  it("skips fulfilment after payment failure", () => {
    const result = orchestrateOrder(request("PAYMENT_FAILED"));
    expect(result.status).toBe("PAYMENT_FAILED");
    expect(result.trace.map((step) => step.status)).toEqual([
      "completed",
      "completed",
      "failed",
      "skipped",
      "completed",
    ]);
  });

  it("stops before payment when stock is unavailable", () => {
    const result = orchestrateOrder(request("OUT_OF_STOCK"));
    expect(result.status).toBe("OUT_OF_STOCK");
    expect(result.trace.map((step) => step.status)).toEqual([
      "failed",
      "skipped",
      "skipped",
      "skipped",
      "completed",
    ]);
  });

  it("uses available inventory rather than trusting a success scenario", () => {
    const noStock = request("SUCCESS");
    noStock.items[0].availableStock = 0;
    expect(orchestrateOrder(noStock).status).toBe("OUT_OF_STOCK");
  });
});
