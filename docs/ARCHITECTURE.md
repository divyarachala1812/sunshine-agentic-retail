# Sunshine architecture

## 1. Purpose

I designed Sunshine as a student scale retail system with clear boundaries between the customer interface, conversational support, order processing, recommendations and analytics.

The system keeps customer actions simple. Technical workflow details remain inside the services and documentation rather than appearing in normal shopping navigation.

## 2. Runtime flow

The runtime follows this sequence.

1. A customer opens the Next.js storefront.
2. The storefront sends support requests to `POST /api/chat`.
3. Ollama can select a supported action, and Sunshine executes it with verified commerce data.
4. The storefront sends order requests to `POST /api/orders`.
5. The order route uses Spring Boot when its service URL is configured and otherwise uses the compatible TypeScript adapter.
6. The storefront sends recommendation requests to `GET /api/recommendations`.
7. The recommendation route uses FastAPI when its service URL is configured and otherwise uses the compatible TypeScript adapter.

## 3. Component responsibilities

1. The Next.js storefront provides the product catalogue, cart, checkout, account menu, profile and chat interface. The implementation is in `src/app` and `src/components`.
2. The customer support route validates requests, uses Ollama for intent selection and creates verified responses. The implementation is in `src/app/api/chat` and `src/lib/customer-assistant.ts`.
3. The Spring Boot service provides typed order validation and bounded order processing. The implementation is in `backend-java/src/main/java`.
4. The FastAPI service provides content based product ranking. The implementation is in `backend-python/app`.
5. The pandas workflow processes raw orders and creates retail KPIs. The implementation is in `backend-python/scripts/retail_kpis.py`.
6. The hosted adapters preserve the order and recommendation contracts on Vercel. The implementation is in `src/app/api`.

## 4. Conversational support boundary

Divya is the customer facing assistant. The Ollama model is used only to interpret the latest customer need and select one supported action.

Supported actions:

1. Search verified products
2. Look up an exact order number
3. List recent orders
4. Explain the current cart
5. Continue to checkout
6. Open general help

Sunshine executes the selected action. The model does not create prices, inventory quantities, order states or delivery dates. Those values come from the current catalogue, browser cart and order history.

If Ollama is not configured, exceeds its limit or returns an unusable response, the built in intent logic provides the same supported customer actions.

## 5. Order processing boundary

The Java service uses a deterministic multi agent workflow coordinated by `OrderOrchestrator`. Each agent owns one business responsibility and returns a typed result to the orchestrator.

1. Catalogue Agent checks availability and creates the temporary inventory reservation.
2. Risk Agent evaluates deterministic address and order rules.
3. Payment Agent handles the selected simulated method.
4. Fulfilment Agent plans picking and packing.
5. Delivery Agent creates the eight customer milestones through delivery.
6. Notification Agent creates the final order history update.

The agents are ordinary bounded Java components rather than language model powered agents. This provides a small, understandable orchestration example without overstating the implementation.

### 5.1 Inventory state transitions

The orchestrator returns an inventory disposition and a per item before, held and after snapshot.

| Branch | Transition | Payment | Delivery |
| --- | --- | --- | --- |
| Confirmed | Available to reserved to committed | Approved | Eight milestones created |
| Payment failed | Available to reserved to released | Declined | No shipment created |
| Out of stock | Available to rejected | Not attempted | No shipment created |

The browser commits the returned stock value only for a confirmed order. The failed payment branch restores the earlier availability, while the stock conflict branch marks the affected product unavailable for the current browser demonstration.

### 5.2 Customer delivery timeline

The customer interface converts the internal trace into eight familiar stages: order received, items reserved, payment confirmed, picking, packed, shipped, out for delivery and delivered. Completed, current, upcoming and stopped states use the same typed contract in Java and the hosted TypeScript adapter. Internal agent names remain in technical evidence only.

## 6. Deployment

Vercel hosts the Next.js application and its route handlers. Java and Python services can run locally through Docker Compose or on external container platforms.

Environment variables:

1. `JAVA_BACKEND_URL` sends order requests to the Spring Boot service.
2. `PYTHON_BACKEND_URL` sends recommendation requests to the FastAPI service.
3. `OLLAMA_API_KEY` enables Ollama Cloud language understanding on the server.
4. `OLLAMA_MODEL` selects the configured Ollama Cloud model.

The Ollama key remains server only. It is never included in a browser response or committed to the repository.

## 7. State and data

The product catalogue and public demonstration orders are static synthetic data. The following customer state is stored in versioned browser storage.

1. Shopping cart
2. Personal demonstration orders
3. Per browser inventory changes
4. Personal order timelines and inventory outcomes

This design keeps the public project safe and reproducible. It is not presented as shared warehouse inventory or production customer persistence.

## 8. Limitations

1. The public deployment does not contain a shared customer database.
2. Payment and delivery operations are simulations.
3. Ollama Cloud availability depends on the selected account plan.
4. Content based recommendations do not learn from personal behaviour.
5. External Java and Python deployment URLs must be configured separately when those services are hosted.
