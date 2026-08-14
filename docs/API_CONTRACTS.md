# Sunshine API contracts

## 1. Customer support

Endpoint: `POST /api/chat`

The browser sends a short conversation together with verified browser state.

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Women casual sneakers size 7"
    }
  ],
  "orders": [],
  "cart": [],
  "inventory": [
    {
      "productId": "FO-001",
      "availableStock": 26
    }
  ]
}
```

The response contains customer text, verified products, optional action links and optional quick replies.

```json
{
  "message": "I found three casual options from the Sunshine catalogue.",
  "products": [],
  "suggestedSize": "7",
  "quickReplies": [
    "Show me another style",
    "What is in my cart?"
  ],
  "actions": [],
  "source": "ollama"
}
```

The `source` value is `ollama` when the cloud model selected the supported action. It is `sunshine` when the built in intent logic handled the request.

The endpoint validates message length and collection limits. The Ollama credential remains on the server.

## 2. Create order

Endpoint: `POST /api/orders`

```json
{
  "items": [
    {
      "productId": "WO-001",
      "slug": "anvi-aarohi-floral-kurta-set",
      "name": "Aarohi Floral Kurta Set",
      "price": 1499,
      "quantity": 1,
      "selectedSize": "S",
      "availableStock": 18
    }
  ],
  "customer": {
    "name": "Divya Rachala",
    "phone": "9876543210",
    "address": "Madhapur",
    "city": "Hyderabad",
    "pincode": "500081"
  },
  "paymentMethod": "UPI",
  "scenario": "SUCCESS"
}
```

Supported payment methods:

1. `UPI`
2. `CARD`
3. `COD`

Supported demonstration scenarios:

1. `SUCCESS`
2. `PAYMENT_FAILED`
3. `OUT_OF_STOCK`

Example response:

```json
{
  "orderId": "SUN-41633158892",
  "status": "CONFIRMED",
  "total": 1499,
  "deliveryFee": 0,
  "estimatedDelivery": "Mon, 17 Aug",
  "paymentReference": "UPI-41633158744",
  "paymentMethod": "UPI",
  "deliveryStatus": "PROCESSING",
  "destinationCity": "Hyderabad",
  "createdAt": "2026-08-13T17:00:00Z",
  "items": [],
  "message": "Your order is confirmed and is being prepared for dispatch.",
  "inventoryDisposition": "COMMITTED",
  "inventory": [
    {
      "productId": "WO-001",
      "name": "Aarohi Floral Kurta Set",
      "requested": 1,
      "availableBefore": 18,
      "reserved": 1,
      "availableAfter": 17
    }
  ],
  "milestones": [
    {
      "code": "ORDER_RECEIVED",
      "label": "Order received",
      "state": "COMPLETED",
      "message": "The order details were validated and recorded.",
      "occurredAt": "2026-08-13T17:00:00Z"
    }
  ],
  "trace": []
}
```

`inventoryDisposition` is `COMMITTED`, `RELEASED` or `REJECTED`. Each response carries the quantity before checkout, the temporary hold and the final availability. `milestones` contains the eight customer stages and uses `COMPLETED`, `CURRENT`, `UPCOMING` or `STOPPED` state. The internal `trace` records bounded service steps, but agent names are not shown in normal shopping navigation.

When Spring Boot handles the request, the response contains `x-sunshine-service: java`. The hosted adapter uses `x-sunshine-service: vercel-adapter`.

## 3. Product recommendations

Endpoint: `GET /api/recommendations?slug=<product slug>`

The Next.js route passes a compact same category product set to FastAPI when `PYTHON_BACKEND_URL` is configured.

Scoring method:

```text
score = rating multiplied by 2, then reduced by the absolute price difference divided by the reference price
```

Response:

```json
{
  "products": [],
  "source": "python"
}
```

The `source` value is `python` when FastAPI produced the ranking. It is `fallback` when the TypeScript adapter produced the same deterministic result.
