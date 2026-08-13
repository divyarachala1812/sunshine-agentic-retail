import { products } from "@/data/products";
import { formatInr } from "@/lib/format";
import type {
  AssistantIntent,
  AssistantReply,
  AssistantRequest,
} from "@/types/assistant";
import type { Product } from "@/types/commerce";

const ORDER_NUMBER = /sun-[a-z0-9-]+/i;
const PRICE_LIMIT = /(?:under|below|less than|up to|within)\s*(?:rs\.?|₹)?\s*([\d,]+)/i;
const SHOE_SIZE = /(?:size\s*)?(11|10|[4-9])\b/i;

const synonymGroups: Array<[string[], string[]]> = [
  [["sneaker", "sneakers", "shoe", "shoes"], ["sneakers", "running shoes", "footwear"]],
  [["mobile", "cellphone"], ["smartphone", "phone"]],
  [["headphone", "headphones", "earphone", "earphones"], ["earbuds", "speaker"]],
  [["computer", "notebook"], ["laptop"]],
  [["purse", "handbag"], ["bag", "tote", "crossbody"]],
  [["traditional", "ethnic"], ["kurta", "saree", "lehenga", "jutti"]],
  [["bedsheet", "bedding"], ["bedsheet", "comforter"]],
];

const styleTerms = ["casual", "everyday", "running", "formal", "festive", "wedding", "college", "work", "sports", "slides", "sandals", "heels", "flats", "jutti"];
const productTerms = ["sneaker", "shoe", "footwear", "kurta", "saree", "lehenga", "dress", "shirt", "jeans", "trouser", "jacket", "laptop", "phone", "earbud", "watch", "speaker", "tablet", "monitor", "keyboard", "bag", "backpack", "tote", "bedsheet", "comforter", "lamp", "fan", "home", "electronics", "fashion"];

function clean(value: string) {
  return value.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9₹., -]/g, " ").replace(/\s+/g, " ").trim();
}

function recentConversation(request: AssistantRequest) {
  return clean(request.messages.slice(-6).map((message) => message.content).join(" "));
}

function latestMessage(request: AssistantRequest) {
  return clean(request.messages.at(-1)?.content ?? "");
}

function detectAudience(text: string) {
  if (/\b(women|womens|woman|ladies|girls)\b/.test(text)) return "women";
  if (/\b(men|mens|man|gents|boys)\b/.test(text)) return "men";
  if (/\b(unisex|anyone)\b/.test(text)) return "unisex";
  return undefined;
}

function detectStyle(text: string) {
  return styleTerms.find((style) => text.includes(style));
}

function detectSize(text: string) {
  return text.match(SHOE_SIZE)?.[1];
}

function detectMaxPrice(text: string) {
  const value = text.match(PRICE_LIMIT)?.[1];
  return value ? Number(value.replaceAll(",", "")) : undefined;
}

function productSearchDocument(product: Product) {
  const derived = product.name.toLowerCase().includes("sneaker")
    ? "casual everyday unisex shoe sneakers college"
    : product.name.toLowerCase().includes("running shoe")
      ? "sports running unisex shoe sneakers"
      : product.category === "women"
        ? "women womens ladies"
        : product.category === "men"
          ? "men mens gents"
          : "";
  return clean([product.name, product.brand, product.categoryLabel, product.description, product.colour, derived].join(" "));
}

function expandQuery(query: string) {
  const expanded = new Set(clean(query).split(" ").filter((token) => token.length > 2));
  for (const [triggers, additions] of synonymGroups) {
    if (triggers.some((trigger) => expanded.has(trigger))) additions.forEach((term) => expanded.add(term));
  }
  return [...expanded];
}

function rankProducts(intent: Extract<AssistantIntent, { kind: "search_products" }>, inventory: Map<string, number>) {
  const query = clean([intent.query, intent.style, intent.audience].filter(Boolean).join(" "));
  const terms = expandQuery(query);
  const shoeRequest = /\b(sneaker|sneakers|shoe|shoes|footwear)\b/.test(query);
  const sneakerRequest = /\b(sneaker|sneakers)\b/.test(query);
  return products
    .filter((product) => {
      if (!shoeRequest) return true;
      if (product.category !== "footwear") return false;
      if (sneakerRequest && !/sneaker|running shoe/i.test(product.name)) return false;
      if ((intent.style === "casual" || intent.style === "everyday") && /running/i.test(product.name)) return false;
      if (intent.style === "running" && !/running/i.test(product.name)) return false;
      return /sneaker|shoe|jutti|sandal|flat|slide/i.test(product.name);
    })
    .map((product) => {
      const document = productSearchDocument(product);
      let score = terms.reduce((total, term) => total + (document.includes(term) ? 2 : 0), 0);
      if (intent.style && document.includes(intent.style)) score += 4;
      if (intent.audience && document.includes(intent.audience)) score += 2;
      if (intent.size && product.sizes?.includes(intent.size)) score += 3;
      if (intent.maxPrice && product.price <= intent.maxPrice) score += 2;
      if ((inventory.get(product.id) ?? product.stock) === 0) score -= 8;
      score += product.rating / 10;
      return { product, score };
    })
    .filter(({ product, score }) => score > 0 && (!intent.maxPrice || product.price <= intent.maxPrice))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ product }) => product);
}

function baseReply(source: AssistantReply["source"]): AssistantReply {
  return { message: "", products: [], quickReplies: [], actions: [], source };
}

export function inferIntent(request: AssistantRequest): AssistantIntent {
  const latest = latestMessage(request);
  const orderNumber = latest.match(ORDER_NUMBER)?.[0]?.toUpperCase();
  if (orderNumber) return { kind: "lookup_order", orderId: orderNumber };
  if (/\b(recent orders|my orders|order history|what did i order|what have i ordered)\b/.test(latest)) return { kind: "list_orders" };
  if (/\b(checkout|place (?:the |my )?order|complete (?:the |my )?order|pay now)\b/.test(latest)) return { kind: "checkout" };
  if (/\b(cart|bag|what did i add)\b/.test(latest)) return { kind: "view_cart" };

  const context = recentConversation(request);
  if (productTerms.some((term) => context.includes(term)) || /\b(find|show|suggest|recommend|looking for|want|need|buy)\b/.test(latest)) {
    return {
      kind: "search_products",
      query: context,
      audience: detectAudience(context),
      style: detectStyle(context),
      size: detectSize(latest) ?? detectSize(context),
      maxPrice: detectMaxPrice(latest) ?? detectMaxPrice(context),
    };
  }
  return { kind: "help" };
}

export function respondToIntent(
  intent: AssistantIntent,
  request: AssistantRequest,
  source: AssistantReply["source"] = "sunshine",
): AssistantReply {
  const reply = baseReply(source);
  const inventory = new Map(request.inventory.map((item) => [item.productId, item.availableStock]));

  if (intent.kind === "lookup_order") {
    const order = request.orders.find((item) => item.orderId.toUpperCase() === intent.orderId.toUpperCase());
    if (!order) {
      reply.message = `I couldn’t find ${intent.orderId} in the public examples or this browser’s order history. Please check the number and try again.`;
      reply.actions = [{ label: "View recent orders", href: "/profile#orders", kind: "profile" }];
      return reply;
    }
    const items = order.items.map((item) => `${item.quantity} item of ${item.name}${item.selectedSize ? `, size ${item.selectedSize}` : ""}`).join("; ");
    const delivery = order.estimatedDelivery ?? "No delivery was created";
    reply.message = `${order.orderId} is ${order.status.replaceAll("_", " ").toLowerCase()}. It contains ${items}. Delivery update: ${delivery}. ${order.message}`;
    reply.actions = [{ label: "View order details", href: `/order/${order.orderId}`, kind: "order" }];
    return reply;
  }

  if (intent.kind === "list_orders") {
    if (!request.orders.length) {
      reply.message = "There are no orders in this browser yet. I can help you find something to start with.";
      reply.quickReplies = ["Show casual sneakers", "Suggest a kurta", "Find electronics under ₹3,000"];
      return reply;
    }
    const summaries = request.orders.slice(0, 3).map((order) => {
      const item = order.items[0]?.name ?? "Order";
      const delivery = order.estimatedDelivery ?? order.status.replaceAll("_", " ").toLowerCase();
      return `${order.orderId}: ${item}. ${delivery}`;
    });
    reply.message = `Here are the latest orders I can see in this browser:\n${summaries.join("\n")}`;
    reply.actions = [{ label: "See all recent orders", href: "/profile#orders", kind: "profile" }];
    return reply;
  }

  if (intent.kind === "view_cart") {
    if (!request.cart.length) {
      reply.message = "Your cart is empty. Tell me what you’re shopping for and I’ll suggest a few verified options.";
      reply.quickReplies = ["Women · casual · size 7", "Men · running · size 9", "Electronics under ₹3,000"];
      return reply;
    }
    const lines = request.cart.map((item) => `${item.quantity} item of ${item.name}${item.selectedSize ? `, size ${item.selectedSize}` : ""}`);
    reply.message = `Your cart has ${lines.join("; ")}. Would you like to review it or continue to checkout?`;
    reply.actions = [
      { label: "Open cart", href: "/cart", kind: "cart" },
      { label: "Continue to checkout", href: "/checkout", kind: "checkout" },
    ];
    return reply;
  }

  if (intent.kind === "checkout") {
    reply.message = request.cart.length
      ? "Your selections are ready. Please review the delivery address and payment method before confirming the demo order."
      : "Your cart is empty, so there is nothing to place yet. I can help you find a product first.";
    reply.actions = request.cart.length ? [{ label: "Review checkout", href: "/checkout", kind: "checkout" }] : [];
    reply.quickReplies = request.cart.length ? ["What is in my cart?"] : ["Show casual sneakers", "Suggest a kurta"];
    return reply;
  }

  if (intent.kind === "search_products") {
    const context = recentConversation(request);
    const shoeRequest = /\b(sneaker|sneakers|shoe|shoes|footwear)\b/.test(context);
    const audience = intent.audience ?? detectAudience(context);
    const style = intent.style ?? detectStyle(context);
    const size = intent.size ?? detectSize(context);
    if (shoeRequest && (!audience || !style || !size)) {
      reply.message = "I can narrow that down for you. Tell me all three in one reply: women’s, men’s or unisex; casual or running; and your shoe size from 4 to 11.";
      reply.quickReplies = ["Women · casual · size 7", "Men · running · size 9", "Unisex · everyday · size 8"];
      return reply;
    }
    const refinedIntent = { ...intent, audience, style, size };
    const matches = rankProducts(refinedIntent, inventory);
    if (!matches.length) {
      reply.message = "I couldn’t find an available exact match. Try changing the style, size or budget and I’ll search again.";
      reply.quickReplies = ["Show all sneakers", "Suggest fashion", "Electronics under ₹3,000"];
      return reply;
    }
    const budgetText = intent.maxPrice ? ` under ${formatInr(intent.maxPrice)}` : "";
    reply.message = `I found ${matches.length} strong ${style ? `${style} ` : ""}option${matches.length === 1 ? "" : "s"}${budgetText}. Prices, sizes and stock below are checked against the Sunshine catalogue. Choose a size, then add your pick without leaving the chat.`;
    reply.products = matches;
    reply.suggestedSize = size;
    reply.quickReplies = ["Show me another style", "What is in my cart?", "Show my recent orders"];
    return reply;
  }

  reply.message = "Hi, I’m Divya, Sunshine’s shopping assistant. I can find products by style, size and budget, add a selected item to your cart, explain checkout, or track an order when you share its order number.";
  reply.quickReplies = ["Help me find sneakers", "Show my recent orders", "What is in my cart?"];
  reply.actions = [{ label: "Open help centre", href: "/help", kind: "help" }];
  return reply;
}

export function createAssistantReply(request: AssistantRequest) {
  return respondToIntent(inferIntent(request), request);
}
