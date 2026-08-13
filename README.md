# Sunshine

Sunshine is an Indian retail application that I built to connect product discovery, conversational shopping, cart management, checkout, order processing, delivery updates and retail analytics in one project.

The application contains a Next.js storefront, a Java Spring Boot order service, a Python FastAPI recommendation service and a small pandas analytics workflow. All catalogue, payment and order data is synthetic. No real payment is collected.

Author: Divya Rachala

Live application: [Sunshine](https://sunshine-agentic-retail.vercel.app)

![Sunshine storefront](docs/screenshots/01_storefront.jpg)

## 1. Project overview

Sunshine provides a complete demonstration shopping journey for customers in India. The catalogue contains 50 products across women’s fashion, men’s fashion, footwear and bags, electronics, and home and living. Prices are displayed in Indian rupees. Delivery rules, address fields and payment choices follow the Indian retail context.

### 1.1 Problem and purpose

Many student commerce projects stop after product listing, cart and checkout screens. The customer support conversation, stock decision, payment result, delivery update and order history often use separate sample data, so the full journey cannot be followed or verified.

The root cause is disconnected application state. A recommendation may not match the real catalogue, a support response may invent an order update, and a failed checkout may not explain which step stopped the order.

I built Sunshine to solve this project gap. The same catalogue, cart, inventory and order records support the storefront, Divya assistant, checkout results and recent orders. The application therefore demonstrates how an ecommerce interface can remain simple for the customer while several focused services coordinate behind it.

The application supports the following customer journey.

1. Search the catalogue or select a category.
2. Review product information, prices, ratings, sizes and delivery estimates.
3. Ask Divya, the conversational shopping assistant, for product suggestions.
4. Select a size and add a suggested product to the cart from the conversation.
5. Review the cart and continue to checkout.
6. Enter an Indian delivery address and select UPI, card or cash on delivery.
7. Complete a simulated order result.
8. Review recent orders and delivery updates from the profile menu.

## 2. Customer experience

### 2.1 Conversational shopping

Divya is available from the support button and the profile menu. The assistant can understand product requests, ask for missing preferences, recommend catalogue items, add a selected size to the cart and provide verified order information.

Example conversation:

```text
Customer: I want nice sneakers.

Divya: Tell me whether they are for women, men or unisex, whether you want casual or running shoes, and your size.

Customer: Women, casual, size 7.

Divya: Here are the strongest available options from the Sunshine catalogue.
```

The assistant uses the optional Ollama Cloud model to interpret natural language. Product prices, sizes, stock and order dates always come from Sunshine data. When Ollama is not configured or is unavailable, the built in support logic continues to provide product discovery, cart help and order lookup.

### 2.2 Profile and orders

The profile menu contains Profile, Recent orders, Account, Chat with Divya and Help centre. The category navigation is reserved for shopping categories.

Every visitor can inspect public order examples for the following states.

1. Arriving today
2. Shipment arriving
3. Delivered
4. Payment failed
5. Item unavailable

Orders placed by a visitor are stored in that browser and appear before the public examples.

![Profile and recent orders](docs/screenshots/07_profile_and_recent_orders.jpg)

### 2.3 Inventory behaviour

The catalogue contains normal, low stock and unavailable products. A confirmed purchase reduces inventory in the current browser. When the final unit is purchased, the product becomes unavailable on the next visit. A failed payment does not reduce inventory.

![Unavailable product](docs/screenshots/08_unavailable_product.jpg)

## 3. Application architecture

The runtime follows this sequence.

1. The customer uses the Next.js storefront in a browser.
2. The storefront sends conversational requests to the customer support route.
3. Ollama can interpret the request, while Sunshine retrieves verified product, cart and order information.
4. Order requests use the Spring Boot service or the compatible hosted adapter.
5. Recommendation requests use the FastAPI service or the compatible hosted adapter.
6. The pandas workflow reads raw order records and produces the retail KPI report.

The Next.js route handlers provide stable application endpoints. When the Java and Python service URLs are configured, requests are passed to those services. The Vercel deployment can use contract compatible TypeScript adapters when the external services are not available.

The conversational support route follows a separate boundary. Ollama interprets customer language and chooses a supported action. Sunshine then executes that action using verified catalogue, cart and order data.

More information is available in [architecture documentation](docs/ARCHITECTURE.md) and [API documentation](docs/API_CONTRACTS.md).

## 4. Technology

1. The storefront uses Next.js 16, React 19, TypeScript and CSS for pages, product discovery, cart, checkout, profile and the chat interface.
2. Conversational support uses Ollama Cloud and TypeScript for natural language intent selection with verified application actions.
3. The order service uses Java 17 and Spring Boot 4 for validation, stock decisions, payment simulation and delivery planning.
4. The recommendation service uses Python 3.13 and FastAPI for deterministic content based product ranking.
5. The analytics workflow uses pandas for raw order cleaning, KPI calculation and JSON output.
6. Quality checks use Vitest, JUnit, pytest and ESLint.
7. Delivery uses Docker Compose, GitHub Actions and Vercel.

## 5. Order processing

The Java order service demonstrates a student scale multi agent order workflow. Five deterministic agents have one responsibility each: catalogue, risk, payment, fulfilment and notification. An order orchestrator passes the result from one agent to the next and stops the workflow when a required step fails.

These agents do not use a language model. They are focused software components that make the sequence, failure rules and service boundaries easy to test. Divya is the separate customer facing AI assistant. This distinction keeps the project description accurate.

The technical workflow remains in the source code and documentation. The customer interface only shows items checked, payment reviewed and delivery update.

The order service supports three demonstration results.

1. A successful order confirms payment eligibility, produces a delivery estimate and records the order.
2. A declined payment releases the reserved item, creates no shipment and keeps the cart available.
3. An unavailable item stops processing before payment and records an inventory update.

## 6. Product recommendations

The FastAPI service ranks related products from the same category. The scoring method combines product rating and relative price distance.

```text
score = rating multiplied by 2, then reduced by the absolute price difference divided by the reference price
```

![Product recommendations](docs/screenshots/02_product_and_recommendations.jpg)

## 7. Retail analytics

The analytics workflow reads a synthetic raw order file, validates the records and creates a reproducible KPI file at `reports/retail_kpis.json`.

1. Orders received: 12
2. Orders confirmed: 9
3. Confirmation rate: 75.0%
4. Confirmed revenue: ₹37,136
5. Average order value: ₹4,126.22
6. Highest revenue city: Delhi
7. Highest revenue category: Electronics

## 8. Local setup

### 8.1 Requirements

1. Node.js 22 or newer
2. Java 17
3. Python 3.13
4. Docker Desktop for the combined setup

### 8.2 Docker Compose

```bash
docker compose up --build
```

Open `http://localhost:3000`.

### 8.3 Individual services

Java service:

```bash
cd backend-java
./mvnw spring-boot:run
```

Python service:

```bash
cd backend-python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Storefront:

```bash
cp .env.example .env.local
npm install
npm run dev
```

The Ollama integration is optional. Add `OLLAMA_API_KEY` as a server environment variable to enable cloud based language understanding. The key must never use the `NEXT_PUBLIC_` prefix.

## 9. Tests

```bash
npm test
npm run lint
npm run build

cd backend-java
./mvnw test

cd backend-python
PYTHONPATH=. pytest -q
```

The automated checks cover pricing, delivery fees, conversational product discovery, order lookup, stock exhaustion, payment failure, recommendation ranking and request validation.

## 10. Data and limitations

1. The catalogue, ratings, prices, orders and delivery updates are synthetic.
2. The application does not process real payments.
3. Personal orders, cart content and inventory changes use browser storage.
4. There is no shared production customer database.
5. Ollama usage depends on the configured account limits.
6. The recommendation service does not use personal behavioural data.

## 11. Project report

The detailed report is available at `output/pdf/Sunshine_Project_Report.pdf`. It contains the project requirements, architecture, application flows, API contracts, analytics results and test evidence.

## 12. Author

Divya Rachala

Bachelor’s student in Data Science

GitHub: [divyarachala1812](https://github.com/divyarachala1812)

License: [MIT](LICENSE)
