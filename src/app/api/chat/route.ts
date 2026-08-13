import { respondToIntent, createAssistantReply } from "@/lib/customer-assistant";
import { inferIntentWithOllama } from "@/lib/ollama-assistant";
import type { AssistantRequest } from "@/types/assistant";

export const maxDuration = 20;

function isValidRequest(value: unknown): value is AssistantRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<AssistantRequest>;
  return Boolean(
    Array.isArray(request.messages) &&
      request.messages.length > 0 &&
      request.messages.length <= 20 &&
      request.messages.every((message) =>
        ["user", "assistant"].includes(message.role) &&
        typeof message.content === "string" &&
        message.content.trim().length > 0 &&
        message.content.length <= 800,
      ) &&
      Array.isArray(request.orders) &&
      request.orders.length <= 20 &&
      Array.isArray(request.cart) &&
      request.cart.length <= 20 &&
      Array.isArray(request.inventory) &&
      request.inventory.length <= 100,
  );
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!isValidRequest(body)) return Response.json({ error: "Invalid support request" }, { status: 400 });

  try {
    const ollamaIntent = await inferIntentWithOllama(body.messages);
    if (ollamaIntent) return Response.json(respondToIntent(ollamaIntent, body, "ollama"));
  } catch {
    // Verified Sunshine logic remains available if the optional model is unavailable.
  }

  return Response.json(createAssistantReply(body));
}
