# API contracts

## Create an order

`POST /api/orders`

```json
{
  "items": [
    {
      "productId": "WO-001",
      "name": "Aarohi Floral Kurta Set",
      "price": 1499,
      "quantity": 1
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

Supported scenarios are `SUCCESS`, `PAYMENT_FAILED` and `OUT_OF_STOCK`. Supported payment methods are `UPI`, `CARD` and `COD`.

The response has one of three statuses and always includes the agent trace:

```json
{
  "orderId": "SUN-41633158892",
  "status": "CONFIRMED",
  "total": 1499,
  "deliveryFee": 0,
  "estimatedDelivery": "Mon, 17 Aug",
  "paymentReference": "UPI-41633158744",
  "message": "Your order is confirmed and is being prepared for dispatch.",
  "trace": [
    {
      "agent": "Catalogue Agent",
      "status": "completed",
      "message": "1 item type checked and reserved.",
      "durationMs": 126
    }
  ]
}
```

When the Spring Boot service responds, the Next.js route adds `x-sunshine-service: java`. Otherwise, it adds `x-sunshine-service: vercel-adapter`.

## Product recommendations

The browser calls `GET /api/recommendations?slug=<product-slug>`. The Next.js route passes a compact product set to FastAPI at `POST /recommendations` when `PYTHON_BACKEND_URL` is configured.

The scoring formula prioritises same-category products, higher ratings and prices close to the reference item:

```text
score = rating × 2 - absolute price difference / reference price
```

The browser response contains complete product objects plus a `source` field of `python` or `fallback`.
