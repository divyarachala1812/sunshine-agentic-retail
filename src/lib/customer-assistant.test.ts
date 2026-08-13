import { describe, expect, it } from "vitest";
import { createAssistantReply, inferIntent } from "@/lib/customer-assistant";
import { demoOrders } from "@/data/demo-orders";
import type { AssistantRequest } from "@/types/assistant";

const request = (content: string, earlier: AssistantRequest["messages"] = []): AssistantRequest => ({
  messages: [...earlier, { role: "user", content }],
  orders: demoOrders,
  cart: [],
  inventory: [],
});

describe("Sunshine customer assistant", () => {
  it("asks for all useful sneaker preferences together", () => {
    const reply = createAssistantReply(request("I want nice sneakers"));
    expect(reply.message).toContain("all three");
    expect(reply.quickReplies).toContain("Women · casual · size 7");
  });

  it("carries sneaker context into the follow-up and returns sized options", () => {
    const reply = createAssistantReply(request("Women casual size 7", [
      { role: "user", content: "I want nice sneakers" },
      { role: "assistant", content: "Tell me audience, style and size." },
    ]));
    expect(reply.products.length).toBeGreaterThan(0);
    expect(reply.products.every((product) => /sneaker/i.test(product.name))).toBe(true);
    expect(reply.products[0].sizes).toContain("7");
    expect(reply.suggestedSize).toBe("7");
  });

  it("returns verified delivery details for an exact order number", () => {
    const reply = createAssistantReply(request("Track SUN-DEMO-2408"));
    expect(reply.message).toContain("Arriving today by 8 PM");
    expect(reply.actions[0].href).toBe("/order/SUN-DEMO-2408");
  });

  it("summarises current cart contents and offers safe next actions", () => {
    const input = request("What is in my cart?");
    input.cart = [{ productId: "FO-001", name: "Aero Everyday Sneakers", quantity: 1, selectedSize: "7" }];
    const reply = createAssistantReply(input);
    expect(reply.message).toContain("Aero Everyday Sneakers");
    expect(reply.actions.map((action) => action.kind)).toEqual(["cart", "checkout"]);
  });

  it("recognises checkout intent without allowing the model to place an order", () => {
    expect(inferIntent(request("Place my order")).kind).toBe("checkout");
  });

  it("answers website policy questions with Sunshine facts", () => {
    const reply = createAssistantReply(request("How much is delivery and when will it arrive?"));
    expect(reply.message).toContain("₹999");
    expect(reply.message).toContain("₹79");
  });

  it("keeps unrelated questions outside the support scope", () => {
    const reply = createAssistantReply(request("What is the weather tomorrow?"));
    expect(reply.message).toContain("only help with the Sunshine website");
  });

  it("explains returns and browser data using website policies", () => {
    expect(createAssistantReply(request("How do returns work?")).message).toContain("seven day return policy");
    expect(createAssistantReply(request("What information is saved?")).message).toContain("local storage");
  });
});
