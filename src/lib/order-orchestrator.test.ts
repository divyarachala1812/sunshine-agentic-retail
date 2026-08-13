import { describe, expect, it } from "vitest";
import { orchestrateOrder } from "@/lib/order-orchestrator";
import type { OrderRequest, OrderScenario } from "@/types/commerce";

const request = (scenario: OrderScenario): OrderRequest => ({
  items: [{ productId: "WO-001", name: "Aarohi Floral Kurta Set", price: 1499, quantity: 1 }],
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
    ]);
  });

  it("skips fulfilment after payment failure", () => {
    const result = orchestrateOrder(request("PAYMENT_FAILED"));
    expect(result.status).toBe("PAYMENT_FAILED");
    expect(result.trace[2].status).toBe("skipped");
  });

  it("stops before payment when stock is unavailable", () => {
    const result = orchestrateOrder(request("OUT_OF_STOCK"));
    expect(result.status).toBe("OUT_OF_STOCK");
    expect(result.trace.map((step) => step.status)).toEqual(["failed", "skipped", "skipped"]);
  });
});
