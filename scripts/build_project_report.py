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


def bullet(text: str) -> Paragraph:
    return Paragraph(f"<font color='#9B5D00'>-</font> {text}", styles["BodySun"])


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
        canvas.drawString(18 * mm, 8.5 * mm, "Sunshine - Agent-based Indian Retail")
        canvas.drawRightString(PAGE_WIDTH - 18 * mm, 8.5 * mm, f"Page {document.page} of 10")
    canvas.restoreState()


story = []

# Page 1 - cover
story += [
    Spacer(1, 12 * mm),
    para("PORTFOLIO PROJECT REPORT", "Eyebrow"),
    para("Sunshine", "ReportTitle"),
    para("Agent-based Indian retail across frontend, Java backend and Python services", "CoverSub"),
    Spacer(1, 6 * mm),
    screenshot("01-storefront.jpg", 168, 93),
    Spacer(1, 8 * mm),
    styled_table([
        ["Author", "Divya Rachala"],
        ["Portfolio focus", "Frontend + Java backend + Python backend/data"],
        ["Project type", "Final-year student-scale retail system"],
        ["Region", "India-first catalogue, pricing and delivery flow"],
        ["Date", "August 2026"],
    ], [42, 120], header=False, font_size=8.6),
    Spacer(1, 8 * mm),
    para("A complete shopper journey from product discovery to a traceable order result. All products, payments and order data are synthetic demonstrations.", "Callout"),
    PageBreak(),
]

# Page 2 - executive summary
story += page_title("01 / EXECUTIVE SUMMARY", "Project purpose and scope", "Sunshine was designed to demonstrate a connected system rather than a collection of unrelated technologies.")
story += [
    para("Problem statement", "SectionTitle"),
    para("A basic product grid does not show what happens after a shopper clicks buy. Sunshine models the complete decision path: stock reservation, payment outcome, delivery planning, customer feedback and a visible operational trace."),
    para("Portfolio objectives", "SectionTitle"),
    bullet("Build a clean, responsive Indian retail experience with prices in INR and familiar delivery expectations."),
    bullet("Use Java for typed order orchestration and failure handling."),
    bullet("Use Python for a FastAPI recommendation endpoint and a pandas retail KPI workflow."),
    bullet("Demonstrate three bounded agents without misrepresenting them as generative AI."),
    bullet("Deploy a working public demo while documenting the boundary between Vercel and local services."),
    para("Delivered scope", "SectionTitle"),
    styled_table([
        ["Area", "Delivered capability", "Evidence"],
        ["Catalogue", "50 synthetic products in five retail categories", "Static data + 50 generated product pages"],
        ["Customer flow", "Search, category, product, cart, checkout and result", "Browser-tested end-to-end paths"],
        ["Java", "Catalogue, Payment and Fulfilment agents", "Spring Boot + three JUnit scenarios"],
        ["Python", "Recommendation API and retail KPI script", "FastAPI + pandas + four pytest checks"],
        ["Delivery", "Docker Compose, CI and Vercel-ready UI", "Three GitHub Actions jobs"],
    ], [30, 78, 55]),
    Spacer(1, 4 * mm),
    para("The scope deliberately excludes authentication, a production database and a real payment gateway. Those choices keep the project explainable and credible for a final-year student.", "BodySun"),
    PageBreak(),
]

# Page 3 - customer journey
story += page_title("02 / CUSTOMER JOURNEY", "From discovery to delivery", "The interface follows a realistic retail sequence while keeping every payment and order operation safely simulated.")
story += [
    styled_table([
        ["Step", "Customer action", "System response"],
        ["1", "Search or choose a category", "Filters the 50-product catalogue"],
        ["2", "Open a product and choose size", "Shows pricing, delivery and recommendations"],
        ["3", "Add item and adjust quantity", "Persists cart in versioned local storage"],
        ["4", "Enter address and payment method", "Validates Indian mobile and PIN formats"],
        ["5", "Choose a demonstration scenario", "Runs success, decline or stock failure"],
        ["6", "Review order result", "Shows order ID, totals and agent trace"],
    ], [13, 70, 80]),
    Spacer(1, 5 * mm),
    screenshot("04-checkout.jpg", 151, 122),
    Spacer(1, 4 * mm),
    para("Retail rules", "SectionTitle"),
    bullet("Free delivery starts at INR 999; smaller carts add INR 79."),
    bullet("UPI, card and cash on delivery are available as simulated methods."),
    bullet("A successful order clears the cart; a declined order keeps it available for retry."),
    PageBreak(),
]

# Page 4 - architecture
story += page_title("03 / SYSTEM ARCHITECTURE", "One browser contract, three technology stacks", "The Next.js route handlers provide stable browser endpoints and proxy to Java or Python when their service URLs are configured.")
story += [
    styled_table([
        ["Layer", "Technology", "Responsibility"],
        ["Browser", "React + TypeScript", "Interactive catalogue, cart and checkout state"],
        ["Web app", "Next.js 16", "Pages, metadata, route handlers and Vercel deployment"],
        ["Order service", "Java 17 + Spring Boot 4", "Validation and three-agent orchestration"],
        ["Recommendation service", "Python 3.13 + FastAPI", "Content-based product ranking"],
        ["Analytics", "pandas", "Raw order CSV to KPI JSON"],
        ["Delivery", "Docker + GitHub Actions", "Reproducible local stack and automated checks"],
    ], [37, 49, 77]),
    Spacer(1, 6 * mm),
    screenshot("03-agent-workflow.jpg", 154, 112),
    Spacer(1, 4 * mm),
    para("Deployment adapter pattern", "SectionTitle"),
    para("If JAVA_BACKEND_URL or PYTHON_BACKEND_URL is present, Next.js proxies to the real service. If a service is unavailable, a TypeScript adapter applies the same deterministic contract so the Vercel demo remains usable. The response identifies the source, which allowed integration tests to prove that Java and Python were actually called locally."),
    PageBreak(),
]

# Page 5 - Java agents
story += page_title("04 / JAVA BACKEND", "Bounded agents and explicit failure paths", "Spring Boot is the canonical order service. The orchestrator calls agents in sequence and stops safely when a prerequisite fails.")
story += [
    styled_table([
        ["Agent", "Input", "Decision", "Output"],
        ["Catalogue", "Cart lines", "Can stock be reserved?", "Reservation or OUT_OF_STOCK"],
        ["Payment", "Reserved order", "Can the method be authorised?", "Reference or PAYMENT_FAILED"],
        ["Fulfilment", "Eligible order + PIN", "When can it arrive?", "Delivery date and plan"],
    ], [29, 40, 48, 46]),
    Spacer(1, 5 * mm),
    para("Why agents instead of one large service?", "SectionTitle"),
    para("Each class owns one reason to change. Inventory rules can evolve without changing delivery logic; payment methods can be extended without rewriting the catalogue check. The orchestrator remains small because it coordinates results rather than implementing every business rule."),
    para("Scenario behaviour", "SectionTitle"),
    styled_table([
        ["Scenario", "Catalogue", "Payment", "Fulfilment"],
        ["SUCCESS", "completed", "completed", "completed"],
        ["PAYMENT_FAILED", "completed", "failed", "skipped"],
        ["OUT_OF_STOCK", "failed", "skipped", "skipped"],
    ], [48, 38, 38, 39]),
    Spacer(1, 5 * mm),
    screenshot("05-order-success.jpg", 151, 92),
    Spacer(1, 3 * mm),
    para("The Java API returned the custom response header x-sunshine-service: java during local integration testing.", "SmallSun"),
    PageBreak(),
]

# Page 6 - Python
story += page_title("05 / PYTHON BACKEND AND DATA", "Recommendations and measurable retail KPIs", "Python has two focused roles: ranking related products through FastAPI and transforming a raw order CSV through pandas.")
story += [
    para("Recommendation method", "SectionTitle"),
    para("The service receives a reference product and same-contract candidates from Next.js. It filters to the same category and ranks by rating and relative price distance. This is intentionally content-based because the demo does not collect customer histories."),
    Table([[para("score = rating x 2 - absolute price difference / reference price", "Callout")]], colWidths=[163 * mm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CREAM),
        ("BOX", (0, 0), (-1, -1), .5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 15),
        ("RIGHTPADDING", (0, 0), (-1, -1), 15),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ])),
    Spacer(1, 5 * mm),
    screenshot("02-product-and-recommendations.jpg", 151, 87),
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

# Page 7 - frontend
story += page_title("06 / FRONTEND DESIGN", "Retail clarity without copying an existing brand", "Sunshine borrows familiar retail information patterns but uses an original visual identity, synthetic products and CSS-built illustration cards.")
story += [
    screenshot("01-storefront.jpg", 150, 129),
    Spacer(1, 4 * mm),
    styled_table([
        ["Decision", "Reason"],
        ["Warm cream, yellow and green palette", "Creates a recognisable Sunshine identity without imitating Amazon"],
        ["Server-rendered catalogue pages", "Fast initial content and shareable product URLs"],
        ["Small client components", "Interactivity is limited to cart, size, checkout and recommendations"],
        ["CSS product illustrations", "Avoids unlicensed brand photography and keeps the repository self-contained"],
        ["Responsive grids", "Five desktop columns become two on small phones"],
    ], [57, 106]),
    Spacer(1, 4 * mm),
    para("Accessibility checks include labelled search, semantic navigation, form labels, radio groups, keyboard-reachable buttons, visible focus styles and readable success/failure text that does not depend only on colour."),
    PageBreak(),
]

# Page 8 - scenario evidence
story += page_title("07 / FAILURE HANDLING", "A failed payment is a designed outcome", "A portfolio system should explain what happens when an operation does not succeed, not hide every failure behind a generic error message.")
story += [
    screenshot("06-payment-failure.jpg", 154, 126),
    Spacer(1, 5 * mm),
    para("Observed behaviour", "SectionTitle"),
    bullet("The catalogue reservation completes before payment begins."),
    bullet("The Payment Agent returns failed with a method-specific explanation."),
    bullet("The Fulfilment Agent is marked skipped because payment eligibility was not met."),
    bullet("No payment reference or delivery date is generated."),
    bullet("The cart remains available so the customer can retry without rebuilding it."),
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

# Page 9 - verification and deployment
story += page_title("08 / QUALITY AND DELIVERY", "Automated checks across the complete stack", "Tests target business behaviour rather than only verifying that files compile.")
story += [
    styled_table([
        ["Quality gate", "Coverage", "Result"],
        ["Vitest", "Pricing, delivery fee and three adapter scenarios", "6 passed"],
        ["JUnit", "Success, payment decline and out-of-stock orchestration", "3 passed"],
        ["pytest", "Ranking category, determinism, API and validation", "4 passed"],
        ["ESLint", "React and TypeScript quality rules", "Passed"],
        ["Next.js build", "Routes, types and 50 product paths", "59 pages generated"],
        ["Browser QA", "Product, cart, checkout, success and failure", "Passed"],
        ["Integration", "Next.js -> Java and Next.js -> Python", "Both sources confirmed"],
    ], [38, 86, 39]),
    Spacer(1, 6 * mm),
    para("Continuous integration", "SectionTitle"),
    para("GitHub Actions runs three independent jobs. The frontend job installs Node 22 dependencies, tests, lints and builds. The Java job sets up Temurin 17 and runs Maven Wrapper tests. The Python job installs versioned requirements and runs pytest."),
    para("Deployment", "SectionTitle"),
    bullet("Docker Compose starts the Next.js, Java and Python services as one local system."),
    bullet("Vercel hosts the public Next.js interface and compatible route adapters."),
    bullet("Environment variables switch the route handlers to external Java and Python services without browser changes."),
    Spacer(1, 5 * mm),
    styled_table([
        ["Environment variable", "Purpose"],
        ["JAVA_BACKEND_URL", "Proxy order requests to Spring Boot"],
        ["PYTHON_BACKEND_URL", "Proxy recommendation scoring to FastAPI"],
    ], [62, 101]),
    Spacer(1, 5 * mm),
    para("Security boundary", "SectionTitle"),
    para("The demo never requests real card, UPI, password or customer identity data. The checkout form explicitly asks for sample information and does not persist delivery details."),
    PageBreak(),
]

# Page 10 - retrospective
story += page_title("09 / REFLECTION", "What this project proves and what comes next", "The strongest part of Sunshine is not any single framework; it is the connection between customer state, service contracts, failure rules and verifiable outputs.")
story += [
    para("Skills demonstrated", "SectionTitle"),
    styled_table([
        ["Interview topic", "Concrete example to discuss"],
        ["React state", "Versioned cart store built with useSyncExternalStore"],
        ["Next.js", "Server-rendered product paths plus small client boundaries"],
        ["Java design", "Constructor-injected agents coordinated by OrderOrchestrator"],
        ["Python API", "Typed FastAPI request model and deterministic ranking"],
        ["Data analysis", "CSV-to-JSON KPI pipeline with pandas"],
        ["Failure handling", "Early exit, skipped steps and retry-safe cart state"],
        ["Deployment", "Contract-preserving adapter for platform runtime limits"],
    ], [49, 114]),
    Spacer(1, 5 * mm),
    para("Limitations", "SectionTitle"),
    bullet("Synthetic data cannot prove real customer demand or production-scale performance."),
    bullet("The application has no authentication, persistent order database or live stock source."),
    bullet("Content-based ranking does not learn from user behaviour."),
    bullet("Illustrative agent durations are trace labels, not benchmarks."),
    para("Reasonable next steps", "SectionTitle"),
    bullet("Add PostgreSQL order persistence and idempotency keys."),
    bullet("Deploy Spring Boot and FastAPI to suitable container runtimes and configure Vercel URLs."),
    bullet("Introduce a real event log and observable correlation ID across services."),
    bullet("Replace synthetic recommendations only when consented behavioural data is available."),
    Spacer(1, 6 * mm),
    Table([[para("Sunshine is intentionally a finished, explainable student project rather than an unfinished enterprise platform.", "Callout")]], colWidths=[163 * mm], style=TableStyle([
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
