# Sunshine architecture

Sunshine is a student-scale polyglot retail system. It keeps the responsibilities small enough to explain in an interview while still demonstrating a complete customer journey and real service boundaries.

## Runtime flow

```mermaid
flowchart LR
    U[Customer browser] --> N[Next.js storefront]
    N --> O[POST /api/orders]
    N --> R[GET /api/recommendations]
    O -->|JAVA_BACKEND_URL set| J[Spring Boot order service]
    R -->|PYTHON_BACKEND_URL set| P[FastAPI recommendation service]
    O -->|service unavailable| OA[TypeScript order adapter]
    R -->|service unavailable| RA[TypeScript scoring adapter]
    J --> C[Catalogue Agent]
    C --> Y[Payment Agent]
    Y --> F[Fulfilment Agent]
```

The public Vercel deployment uses the two TypeScript adapters because Vercel Functions do not provide a Java runtime. The Java and Python services remain the canonical local service implementations and use the same request and response contracts as the hosted adapters.

## Service responsibilities

| Component | Responsibility | Main evidence |
|---|---|---|
| Next.js frontend | Search, catalogue, product pages, cart, checkout and order trace | `src/app`, `src/components` |
| Spring Boot backend | Order validation and three-agent orchestration | `backend-java/src/main/java` |
| FastAPI backend | Content-based product ranking | `backend-python/app` |
| Python analytics | Reads raw order CSV and produces retail KPIs | `backend-python/scripts/retail_kpis.py` |
| Vercel adapters | Keep the deployed demo functional with matching contracts | `src/app/api` |

## Agent rules

1. The Catalogue Agent runs first. If stock is unavailable, payment and fulfilment are skipped.
2. The Payment Agent runs only after a reservation. If authorisation fails, the reserved stock is released and fulfilment is skipped.
3. The Fulfilment Agent runs only after payment eligibility is confirmed. It returns the estimated delivery date.
4. Every step returns a trace item containing its name, status, explanation and demonstration duration.

These are deterministic software agents with bounded responsibilities. No large language model is used in the order path.

## Data choices

The 50 products are a curated synthetic catalogue designed for an Indian retail demonstration. Prices, ratings and inventory are fictional. The raw KPI file contains 12 synthetic order records across Indian metro cities. Synthetic data is used so the repository contains no personal customer information or copyrighted product images.

## Deployment boundary

- Vercel: Next.js pages and serverless route handlers.
- Local or container host: Spring Boot and FastAPI services.
- `JAVA_BACKEND_URL` and `PYTHON_BACKEND_URL`: switch the Next.js routes from adapters to real services without changing browser code.
- No database or real payment gateway: cart state uses local storage and the order result uses session storage.

## Deliberate limitations

- Authentication, persistent order storage and real payment processing are excluded.
- Stock is demonstrated through controlled scenarios rather than a warehouse database.
- Recommendation scoring is content-based, not collaborative filtering, because no real customer history is collected.
- Agent durations are illustrative values that make the trace easier to read; they are not performance benchmarks.
