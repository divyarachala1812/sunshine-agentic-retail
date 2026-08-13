from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "Sunshine_Project_Report.pdf"
SCREENSHOTS = ROOT / "docs" / "screenshots"

FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

pdfmetrics.registerFont(TTFont("SunshineSans", FONT_REGULAR))
pdfmetrics.registerFont(TTFont("SunshineSansBold", FONT_BOLD))

PAGE_WIDTH, PAGE_HEIGHT = A4
INK = colors.HexColor("#20221D")
MUTED = colors.HexColor("#66685F")
SUN = colors.HexColor("#F4B83F")
LEAF = colors.HexColor("#2D5B4D")
CREAM = colors.HexColor("#F7F3E9")
PALE_GREEN = colors.HexColor("#DFEEE7")
PALE_RED = colors.HexColor("#F7DFDC")
LINE = colors.HexColor("#DDD7CA")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="ReportTitle",
    fontName="SunshineSansBold",
    fontSize=31,
    leading=35,
    textColor=INK,
    spaceAfter=9,
))
styles.add(ParagraphStyle(
    name="PageTitle",
    fontName="SunshineSansBold",
    fontSize=22,
    leading=26,
    textColor=INK,
    spaceAfter=12,
))
styles.add(ParagraphStyle(
    name="SectionTitle",
    fontName="SunshineSansBold",
    fontSize=13,
    leading=16,
    textColor=LEAF,
    spaceBefore=7,
    spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="BodySun",
    fontName="SunshineSans",
    fontSize=9.2,
    leading=13.3,
    textColor=INK,
    spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="SmallSun",
    fontName="SunshineSans",
    fontSize=7.4,
    leading=10.2,
    textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="Eyebrow",
    fontName="SunshineSansBold",
    fontSize=7.5,
    leading=9,
    textColor=colors.HexColor("#9B5D00"),
    uppercase=True,
    tracking=1.2,
    spaceAfter=7,
))
styles.add(ParagraphStyle(
    name="CoverSub",
    fontName="SunshineSans",
    fontSize=12,
    leading=18,
    textColor=MUTED,
    spaceAfter=10,
))
styles.add(ParagraphStyle(
    name="Callout",
    fontName="SunshineSansBold",
    fontSize=11,
    leading=15,
    textColor=INK,
    alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="CenterSmall",
    parent=styles["SmallSun"],
    alignment=TA_CENTER,
))


def para(text: str, style: str = "BodySun") -> Paragraph:
    return Paragraph(text, styles[style])


def page_title(number: str, title: str, summary: str) -> list:
    return [
        para(number, "Eyebrow"),
        para(title, "PageTitle"),
        para(summary, "BodySun"),
        Spacer(1, 3 * mm),
    ]


def numbered(number: int, text: str) -> Paragraph:
    return Paragraph(f"<font color='#9B5D00'><b>{number}.</b></font> {text}", styles["BodySun"])


def screenshot(filename: str, width_mm: float, max_height_mm: float) -> Image:
    image = Image(str(SCREENSHOTS / filename))
    target_width = width_mm * mm
    ratio = target_width / image.imageWidth
    target_height = image.imageHeight * ratio
    if target_height > max_height_mm * mm:
        target_height = max_height_mm * mm
        ratio = target_height / image.imageHeight
        target_width = image.imageWidth * ratio
    image.drawWidth = target_width
    image.drawHeight = target_height
    image.hAlign = "CENTER"
    return image


def styled_table(data, widths, header=True, font_size=7.7) -> Table:
    table = Table(data, colWidths=[width * mm for width in widths], repeatRows=1 if header else 0)
    commands = [
        ("FONTNAME", (0, 0), (-1, -1), "SunshineSans"),
        ("FONTSIZE", (0, 0), (-1, -1), font_size),
        ("LEADING", (0, 0), (-1, -1), font_size + 3),
        ("TEXTCOLOR", (0, 0), (-1, -1), INK),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("ROWBACKGROUNDS", (0, 1 if header else 0), (-1, -1), [colors.white, CREAM]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ]
    if header:
        commands += [
            ("BACKGROUND", (0, 0), (-1, 0), LEAF),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "SunshineSansBold"),
        ]
    table.setStyle(TableStyle(commands))
    return table


def footer(canvas, document):
    canvas.saveState()
    if document.page == 1:
        canvas.setFillColor(SUN)
        canvas.rect(0, 0, PAGE_WIDTH, 9 * mm, fill=1, stroke=0)
    else:
        canvas.setStrokeColor(LINE)
        canvas.line(18 * mm, 13 * mm, PAGE_WIDTH - 18 * mm, 13 * mm)
        canvas.setFont("SunshineSans", 7)
        canvas.setFillColor(MUTED)
        canvas.drawString(18 * mm, 8.5 * mm, "Sunshine  |  Indian Retail and Conversational Support")
        canvas.drawRightString(PAGE_WIDTH - 18 * mm, 8.5 * mm, f"Page {document.page} of 10")
    canvas.restoreState()


story = []

# Page 1
story += [
    Spacer(1, 12 * mm),
    para("PROJECT REPORT", "Eyebrow"),
    para("Sunshine", "ReportTitle"),
    para("Indian retail, conversational support, Java order processing and Python services", "CoverSub"),
    Spacer(1, 6 * mm),
    screenshot("01_storefront.jpg", 168, 93),
    Spacer(1, 8 * mm),
    styled_table([
        ["Author", "Divya Rachala"],
        ["Application", "Next.js storefront with Java and Python services"],
        ["Customer support", "Divya conversational shopping assistant"],
        ["Region", "Indian catalogue, pricing and delivery flow"],
        ["Date", "August 2026"],
    ], [42, 120], header=False, font_size=8.6),
    Spacer(1, 8 * mm),
    para("A complete shopper journey from product discovery to a traceable order result. All products, payments and order data are synthetic demonstrations.", "Callout"),
    PageBreak(),
]

# Page 2
story += page_title("01 / EXECUTIVE SUMMARY", "Project purpose and scope", "Sunshine connects the customer journey, service contracts, retail data and quality checks in one application.")
story += [
    para("Problem statement and root cause", "SectionTitle"),
    para("Many student commerce projects use disconnected sample data for the storefront, support, checkout and order history. This makes recommendations and delivery updates difficult to verify. Sunshine uses shared catalogue, cart, stock and order records so the complete customer journey remains consistent."),
    para("Project objectives", "SectionTitle"),
    numbered(1, "Build a responsive Indian retail experience with prices in INR and familiar delivery expectations."),
    numbered(2, "Provide conversational product discovery, size selection, cart support and order tracking."),
    numbered(3, "Use Java for typed order processing and explicit failure handling."),
    numbered(4, "Use Python for a FastAPI recommendation endpoint and a pandas retail KPI workflow."),
    numbered(5, "Deploy a working public application with documented runtime boundaries."),
    para("Delivered scope", "SectionTitle"),
    styled_table([
        ["Area", "Delivered capability", "Evidence"],
        ["Catalogue", "50 synthetic products in five retail categories", "Static data and 50 generated product pages"],
        ["Customer flow", "Search, product, cart, checkout, profile and orders", "Browser tested repeat visit paths"],
        ["Java", "Bounded order processing components", "Spring Boot and four JUnit scenarios"],
        ["Python", "Recommendation API and retail KPI script", "FastAPI, pandas and four pytest checks"],
        ["Delivery", "Docker Compose, CI and Vercel ready UI", "Three GitHub Actions jobs"],
    ], [30, 78, 55]),
    Spacer(1, 4 * mm),
    para("The scope deliberately excludes authentication, a production database and a real payment gateway. These boundaries keep the demonstration safe and reproducible.", "BodySun"),
    PageBreak(),
]

# Page 3
story += page_title("02 / CUSTOMER JOURNEY", "From discovery to delivery", "The interface follows a realistic retail sequence while keeping every payment and order operation safely simulated.")
story += [
    styled_table([
        ["Step", "Customer action", "System response"],
        ["1", "Search or choose a category", "Filters the 50-product catalogue"],
        ["2", "Ask Divya for a product", "Collects style, audience, size and budget"],
        ["3", "Select an option in chat", "Adds the verified product and size to the cart"],
        ["4", "Enter address and payment method", "Validates Indian mobile and PIN formats"],
        ["5", "Choose a demonstration result", "Runs success, decline or stock failure"],
        ["6", "Review profile and recent orders", "Persists history and inventory in the browser"],
    ], [13, 70, 80]),
    Spacer(1, 5 * mm),
    screenshot("04_checkout.jpg", 151, 122),
    Spacer(1, 4 * mm),
    para("Retail rules", "SectionTitle"),
    numbered(1, "Free delivery starts at INR 999. Smaller carts add INR 79."),
    numbered(2, "UPI, card and cash on delivery are available as simulated methods."),
    numbered(3, "A successful order reduces browser stock. A decline keeps stock available for retry."),
    PageBreak(),
]

# Page 4
story += page_title("03 / SYSTEM ARCHITECTURE", "One customer interface, clear service boundaries", "The Next.js application connects conversational support, Java order processing, Python recommendations and hosted adapters through validated contracts.")
story += [
    styled_table([
        ["Layer", "Technology", "Responsibility"],
        ["Browser", "React and TypeScript", "Interactive catalogue, cart and checkout state"],
        ["Web app", "Next.js 16", "Pages, metadata, route handlers and Vercel deployment"],
        ["Customer support", "Ollama Cloud and TypeScript", "Intent selection and verified commerce actions"],
        ["Order service", "Java 17 and Spring Boot 4", "Validation and five component orchestration"],
        ["Recommendation service", "Python 3.13 and FastAPI", "Content based product ranking"],
        ["Analytics", "pandas", "Raw order CSV to KPI JSON"],
        ["Delivery", "Docker and GitHub Actions", "Reproducible local stack and automated checks"],
    ], [37, 49, 77]),
    Spacer(1, 6 * mm),
    para("Runtime sequence", "SectionTitle"),
    numbered(1, "The customer uses the Next.js storefront in a browser."),
    numbered(2, "The storefront sends conversational requests to the customer support route."),
    numbered(3, "Ollama can interpret the request, while Sunshine provides verified product, cart and order data."),
    numbered(4, "Order requests use Spring Boot or the contract compatible hosted adapter."),
    numbered(5, "Recommendation requests use FastAPI or the contract compatible hosted adapter."),
    numbered(6, "The pandas workflow transforms raw order records into reproducible KPI output."),
    Spacer(1, 3 * mm),
    para("Deployment adapter pattern", "SectionTitle"),
    para("If JAVA_BACKEND_URL or PYTHON_BACKEND_URL is present, Next.js proxies to the real service. If a service is unavailable, a TypeScript adapter applies the same deterministic contract so the Vercel demo remains usable. The response identifies the source, which allowed integration tests to prove that Java and Python were actually called locally."),
    PageBreak(),
]

# Page 5
story += page_title("04 / JAVA BACKEND", "A student scale multi agent order workflow", "Spring Boot is the canonical order service. OrderOrchestrator calls five deterministic agents in sequence and stops safely when a prerequisite fails.")
story += [
    styled_table([
        ["Agent", "Input", "Decision", "Output"],
        ["Catalogue", "Cart + stock", "Can stock be reserved?", "Reservation or OUT_OF_STOCK"],
        ["Risk", "Order context", "Do rules pass?", "Approved decision"],
        ["Payment", "Reserved order", "Can payment proceed?", "Reference or failure"],
        ["Fulfilment", "Eligible order", "When can it arrive?", "Shipment plan"],
        ["Notification", "Final result", "Which update applies?", "History event"],
    ], [29, 40, 48, 46]),
    Spacer(1, 5 * mm),
    para("How the orchestration works", "SectionTitle"),
    para("Each agent is an ordinary Java component with one responsibility. The orchestrator passes typed results through the sequence and records completed, failed or skipped steps. These order agents do not use a language model. Divya is the separate customer facing AI assistant."),
    para("Scenario behaviour", "SectionTitle"),
    styled_table([
        ["Scenario", "Catalogue", "Risk", "Payment", "Delivery", "Notify"],
        ["SUCCESS", "done", "done", "done", "done", "done"],
        ["PAYMENT_FAILED", "done", "done", "failed", "skipped", "done"],
        ["OUT_OF_STOCK", "failed", "skipped", "skipped", "skipped", "done"],
    ], [40, 25, 25, 25, 25, 25]),
    Spacer(1, 5 * mm),
    para("Service verification", "SectionTitle"),
    para("Local integration testing confirmed that the Java API handled the order request and returned the x-sunshine-service value java. The hosted adapter returns the value vercel-adapter when the external Java service is not configured."),
    PageBreak(),
]

# Page 6
story += page_title("05 / PYTHON BACKEND AND DATA", "Recommendations and measurable retail KPIs", "Python has two focused roles: ranking related products through FastAPI and transforming a raw order CSV through pandas.")
story += [
    para("Recommendation method", "SectionTitle"),
    para("The service receives a reference product and compatible candidates from Next.js. It filters to the same category and ranks by rating and relative price distance. This is intentionally content based because the demo does not collect customer histories."),
    Table([[para("score = rating multiplied by 2, reduced by absolute price difference divided by reference price", "Callout")]], colWidths=[163 * mm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CREAM),
        ("BOX", (0, 0), (-1, -1), .5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 15),
        ("RIGHTPADDING", (0, 0), (-1, -1), 15),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ])),
    Spacer(1, 5 * mm),
    screenshot("02_product_and_recommendations.jpg", 151, 87),
    Spacer(1, 4 * mm),
    para("KPI pipeline output", "SectionTitle"),
    styled_table([
        ["KPI", "Result"],
        ["Orders received", "12"],
        ["Orders confirmed", "9"],
        ["Confirmation rate", "75.0%"],
        ["Confirmed revenue", "INR 37,136"],
        ["Average order value", "INR 4,126.22"],
        ["Top revenue city / category", "Delhi / Electronics"],
    ], [90, 73]),
    PageBreak(),
]

# Page 7
story += page_title("06 / CUSTOMER INTERFACE", "Conversational support and repeat visit state", "Sunshine combines an original retail identity with a profile menu, Divya support, seeded order examples and private browser activity.")
story += [
    screenshot("07_profile_and_recent_orders.jpg", 150, 116),
    Spacer(1, 4 * mm),
    styled_table([
        ["Decision", "Reason"],
        ["Warm cream, yellow and green palette", "Creates a recognisable Sunshine identity without imitating Amazon"],
        ["Seeded order lifecycle examples", "Every visitor can inspect arriving, shipped, delivered and failed states"],
        ["Versioned browser storage", "Personal orders and stock changes persist privately across visits"],
        ["Low stock product rules", "The final unit becomes unavailable when the shopper returns"],
        ["Conversational product tools", "Verified catalogue options can be added to cart with a selected size"],
        ["Responsive grids", "Profile and orders collapse cleanly on small screens"],
    ], [57, 106]),
    Spacer(1, 4 * mm),
    para("Accessibility checks include labelled search, semantic navigation, form labels, radio groups, keyboard accessible buttons, visible focus styles and readable success and failure text that does not depend only on colour."),
    PageBreak(),
]

# Page 8
story += page_title("07 / FAILURE HANDLING", "A failed payment is a designed outcome", "The application explains what happens when an operation does not succeed instead of hiding the result behind a generic error message.")
story += [
    styled_table([
        ["Customer progress", "Successful order", "Payment failed", "Item unavailable"],
        ["Items checked", "Available", "Available", "Unavailable"],
        ["Payment reviewed", "Accepted", "Declined", "Not started"],
        ["Delivery update", "Estimate created", "Not created", "Not created"],
        ["Cart result", "Cleared", "Available for retry", "Unavailable item remains visible"],
        ["Recent orders", "Confirmed", "Payment failed", "Item unavailable"],
    ], [43, 39, 39, 42]),
    Spacer(1, 7 * mm),
    para("Observed behaviour", "SectionTitle"),
    numbered(1, "The catalogue reservation completes before payment begins."),
    numbered(2, "Payment returns a method specific explanation when authorisation fails."),
    numbered(3, "Delivery planning does not run when payment eligibility is not met."),
    numbered(4, "No payment reference or delivery date is generated."),
    numbered(5, "The cart remains available so the customer can retry without rebuilding it."),
    numbered(6, "The failure is recorded in the visitor's recent order history."),
    Spacer(1, 4 * mm),
    Table([[para("This trace turns a failure into evidence of control flow, state handling and customer communication.", "Callout")]], colWidths=[163 * mm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE_RED),
        ("BOX", (0, 0), (-1, -1), .5, colors.HexColor("#E0B7B2")),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ])),
    PageBreak(),
]

# Page 9
story += page_title("08 / QUALITY AND DELIVERY", "Automated checks across the complete stack", "Tests target business behaviour rather than only verifying that files compile.")
story += [
    styled_table([
        ["Quality gate", "Coverage", "Result"],
        ["Vitest", "Pricing, chat, order lookup and stock aware paths", "12 passed"],
        ["JUnit", "Success, decline, scenario and real stock exhaustion", "4 passed"],
        ["pytest", "Ranking category, determinism, API and validation", "4 passed"],
        ["ESLint", "React and TypeScript quality rules", "Passed"],
        ["Next.js build", "Routes, chat, profile and 50 product paths", "63 pages generated"],
        ["Browser QA", "Profile, last unit, return visit and failures", "Passed"],
        ["Integration", "Next.js to Java and Next.js to Python", "Both sources confirmed"],
    ], [38, 86, 39]),
    Spacer(1, 6 * mm),
    para("Continuous integration", "SectionTitle"),
    para("GitHub Actions runs three independent jobs. The frontend job installs Node 22 dependencies, tests, lints and builds. The Java job sets up Temurin 17 and runs Maven Wrapper tests. The Python job installs versioned requirements and runs pytest."),
    para("Deployment", "SectionTitle"),
    numbered(1, "Docker Compose starts the Next.js, Java and Python services as one local system."),
    numbered(2, "Vercel hosts the public Next.js interface and compatible route adapters."),
    numbered(3, "Environment variables switch the route handlers to external Java and Python services without browser changes."),
    numbered(4, "A private Ollama key enables language understanding without exposing the credential to the browser."),
    Spacer(1, 5 * mm),
    styled_table([
        ["Environment variable", "Purpose"],
        ["JAVA_BACKEND_URL", "Proxy order requests to Spring Boot"],
        ["PYTHON_BACKEND_URL", "Proxy recommendation scoring to FastAPI"],
        ["OLLAMA_API_KEY", "Enable Ollama Cloud intent selection"],
    ], [62, 101]),
    Spacer(1, 5 * mm),
    para("Security boundary", "SectionTitle"),
    para("The demo never requests real card, UPI, password or customer identity data. The checkout form explicitly asks for sample information and does not persist delivery details."),
    PageBreak(),
]

# Page 10
story += page_title("09 / PROJECT SUMMARY", "Implemented capabilities and future scope", "Sunshine connects customer state, conversational support, service contracts, failure rules and reproducible outputs in one application.")
story += [
    para("Implemented capabilities", "SectionTitle"),
    styled_table([
        ["Area", "Implementation"],
        ["React state", "Versioned cart, order and inventory stores with useSyncExternalStore"],
        ["Next.js", "Server rendered product paths plus small client boundaries"],
        ["Java design", "Five constructor injected components coordinated by OrderOrchestrator"],
        ["Conversational AI", "Ollama intent selection with verified product, cart and order actions"],
        ["Python API", "Typed FastAPI request model and deterministic ranking"],
        ["Data analysis", "CSV to JSON KPI pipeline with pandas"],
        ["Failure handling", "Early exit, skipped steps and retry safe cart state"],
        ["Deployment", "Contract preserving adapter for platform runtime limits"],
    ], [49, 114]),
    Spacer(1, 5 * mm),
    para("Limitations", "SectionTitle"),
    numbered(1, "Synthetic data does not represent real customer demand or production scale performance."),
    numbered(2, "The application has no authentication, shared order database or live stock source."),
    numbered(3, "Content based ranking does not learn from user behaviour."),
    numbered(4, "Illustrative processing durations are trace labels, not benchmarks."),
    para("Reasonable next steps", "SectionTitle"),
    numbered(1, "Add PostgreSQL order persistence and idempotency keys."),
    numbered(2, "Deploy Spring Boot and FastAPI to suitable container runtimes and configure Vercel URLs."),
    numbered(3, "Introduce a real event log and an observable correlation ID across services."),
    numbered(4, "Replace synthetic recommendations only when consented behavioural data is available."),
    Spacer(1, 6 * mm),
    Table([[para("Sunshine is a complete student scale project with clear technical and data boundaries.", "Callout")]], colWidths=[163 * mm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE_GREEN),
        ("BOX", (0, 0), (-1, -1), .5, colors.HexColor("#B9D2C5")),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 13),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 13),
    ])),
    Spacer(1, 8 * mm),
    para("Divya Rachala  |  github.com/divyarachala1812", "CenterSmall"),
]

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
document = SimpleDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    rightMargin=18 * mm,
    leftMargin=18 * mm,
    topMargin=18 * mm,
    bottomMargin=18 * mm,
    title="Sunshine Project Report",
    author="Divya Rachala",
)
document.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
