import { orchestrateOrder } from "@/lib/order-orchestrator";
import type { OrderRequest } from "@/types/commerce";

function isValidRequest(value: unknown): value is OrderRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<OrderRequest>;
  return Boolean(
    request.items?.length &&
      request.customer?.name &&
      /^[1-9][0-9]{5}$/.test(request.customer.pincode ?? "") &&
      ["UPI", "CARD", "COD"].includes(request.paymentMethod ?? "") &&
      ["SUCCESS", "PAYMENT_FAILED", "OUT_OF_STOCK"].includes(request.scenario ?? ""),
  );
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!isValidRequest(body)) return Response.json({ error: "Invalid order request" }, { status: 400 });

  const javaBackendUrl = process.env.JAVA_BACKEND_URL;
  if (javaBackendUrl) {
    try {
      const javaResponse = await fetch(`${javaBackendUrl.replace(/\/$/, "")}/api/orders`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4500),
      });
      if (javaResponse.ok) return Response.json(await javaResponse.json(), { headers: { "x-sunshine-service": "java" } });
    } catch {
      // The hosted adapter below keeps the demo working if the Java service is offline.
    }
  }

  return Response.json(orchestrateOrder(body), { headers: { "x-sunshine-service": "vercel-adapter" } });
}
