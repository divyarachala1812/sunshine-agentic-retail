import type { AssistantIntent, AssistantMessage } from "@/types/assistant";

type OllamaToolCall = {
  function?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
};

const tools = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Search the verified Sunshine catalogue. Use for product discovery, suggestions, sizes, styles, audiences and budgets.",
      parameters: {
        type: "object",
        required: ["query"],
        properties: {
          query: { type: "string" },
          audience: { type: "string", enum: ["women", "men", "unisex"] },
          style: { type: "string" },
          size: { type: "string" },
          maxPrice: { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "lookup_order",
      description: "Look up delivery and item details for one exact Sunshine order number.",
      parameters: { type: "object", required: ["orderId"], properties: { orderId: { type: "string" } } },
    },
  },
  {
    type: "function",
    function: { name: "list_orders", description: "List the customer’s recent orders.", parameters: { type: "object", properties: {} } },
  },
  {
    type: "function",
    function: { name: "view_cart", description: "Explain what is currently in the customer’s cart.", parameters: { type: "object", properties: {} } },
  },
  {
    type: "function",
    function: { name: "checkout", description: "Help the customer review or continue to checkout.", parameters: { type: "object", properties: {} } },
  },
  {
    type: "function",
    function: { name: "help", description: "Explain what Sunshine support can do or answer a general store-help question.", parameters: { type: "object", properties: {} } },
  },
];

function asText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function intentFromCall(call: OllamaToolCall): AssistantIntent | null {
  const name = call.function?.name;
  const args = call.function?.arguments ?? {};
  if (name === "search_products") {
    return {
      kind: "search_products",
      query: asText(args.query) ?? "products",
      audience: asText(args.audience),
      style: asText(args.style),
      size: asText(args.size),
      maxPrice: typeof args.maxPrice === "number" && Number.isFinite(args.maxPrice) ? args.maxPrice : undefined,
    };
  }
  if (name === "lookup_order") return { kind: "lookup_order", orderId: asText(args.orderId)?.toUpperCase() ?? "" };
  if (name === "list_orders" || name === "view_cart" || name === "checkout" || name === "help") return { kind: name };
  return null;
}

export async function inferIntentWithOllama(messages: AssistantMessage[]): Promise<AssistantIntent | null> {
  const apiKey = process.env.OLLAMA_API_KEY;
  if (!apiKey) return null;
  const response = await fetch("https://ollama.com/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? "gpt-oss:20b",
      stream: false,
      think: false,
      messages: [
        {
          role: "system",
          content: "You are Divya, a concise customer-support assistant for Sunshine, an Indian demo retail store. Select exactly one tool for the customer’s latest need. Never invent products, stock, prices, orders or delivery dates; Sunshine executes the tool using verified data. Carry useful size, style, audience and budget details forward from the short conversation.",
        },
        ...messages.slice(-8),
      ],
      tools,
    }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { message?: { tool_calls?: OllamaToolCall[] } };
  const call = data.message?.tool_calls?.[0];
  return call ? intentFromCall(call) : null;
}
