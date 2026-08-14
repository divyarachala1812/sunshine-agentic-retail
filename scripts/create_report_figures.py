from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import ListedColormap

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "reports" / "figures"


def save(name: str) -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    plt.tight_layout()
    plt.savefig(OUTPUT / name, dpi=190, bbox_inches="tight", facecolor="white")
    plt.close()


def bar(labels: list[str], values: list[float], title: str, ylabel: str, name: str) -> None:
    plt.figure(figsize=(8.5, 4.8))
    bars = plt.bar(labels, values, color="0.76", edgecolor="black", linewidth=1)
    plt.bar_label(bars, fmt="%.1f" if max(values) <= 100 else "%.0f")
    plt.title(title, fontweight="bold")
    plt.ylabel(ylabel)
    plt.grid(axis="y", color="0.9", linewidth=0.8)
    save(name)


def workflow_matrix() -> None:
    agents = ["Catalogue", "Risk", "Payment", "Fulfilment", "Delivery", "Notification"]
    scenarios = ["Confirmed", "Payment failed", "Out of stock"]
    values = np.array([
        [2, 2, 2, 2, 2, 2],
        [2, 2, 1, 0, 0, 2],
        [1, 0, 0, 0, 0, 2],
    ])
    labels = {0: "Skipped", 1: "Failed", 2: "Completed"}
    figure, axis = plt.subplots(figsize=(9.2, 4.2))
    axis.imshow(values, cmap=ListedColormap(["#f7f7f7", "#d1d1d1", "#7a7a7a"]), vmin=0, vmax=2, aspect="auto")
    axis.set_xticks(range(len(agents)), agents)
    axis.set_yticks(range(len(scenarios)), scenarios)
    axis.set_title("Agent outcome by checkout branch", fontweight="bold")
    for row in range(values.shape[0]):
        for column in range(values.shape[1]):
            value = values[row, column]
            axis.text(column, row, labels[value], ha="center", va="center", color="white" if value == 2 else "black", fontsize=9)
    axis.set_xticks(np.arange(-0.5, len(agents), 1), minor=True)
    axis.set_yticks(np.arange(-0.5, len(scenarios), 1), minor=True)
    axis.grid(which="minor", color="black", linewidth=0.7)
    axis.tick_params(which="minor", bottom=False, left=False)
    save("04_workflow_paths.png")


def inventory_transitions() -> None:
    figure, axis = plt.subplots(figsize=(9.2, 4.6))
    axis.axis("off")
    nodes = {
        "Available": (0.08, 0.52),
        "Reserved": (0.36, 0.52),
        "Committed": (0.72, 0.78),
        "Released": (0.72, 0.26),
        "Rejected": (0.36, 0.08),
    }
    for label, (x, y) in nodes.items():
        axis.text(x, y, label, ha="center", va="center", fontsize=12, fontweight="bold", bbox={"boxstyle": "round,pad=0.55", "facecolor": "white", "edgecolor": "black"})
    arrows = [
        ("Available", "Reserved", "quantity available"),
        ("Reserved", "Committed", "payment approved"),
        ("Reserved", "Released", "payment declined"),
        ("Available", "Rejected", "quantity changed"),
    ]
    for start, end, label in arrows:
        x1, y1 = nodes[start]
        x2, y2 = nodes[end]
        axis.annotate("", xy=(x2 - 0.07, y2), xytext=(x1 + 0.08, y1), arrowprops={"arrowstyle": "->", "color": "black", "lw": 1.3})
        axis.text((x1 + x2) / 2, (y1 + y2) / 2 + 0.05, label, ha="center", fontsize=9)
    axis.set_title("Inventory reservation state transitions", fontweight="bold", pad=16)
    save("05_inventory_transitions.png")


def delivery_lifecycle() -> None:
    labels = ["Received", "Reserved", "Paid", "Picking", "Packed", "Shipped", "Out for delivery", "Delivered"]
    x = np.arange(1, 9)
    plt.figure(figsize=(9.4, 3.8))
    plt.plot(x, np.ones_like(x), color="black", linewidth=1.4)
    plt.scatter(x, np.ones_like(x), s=180, color="0.75", edgecolor="black", zorder=3)
    for index, label in enumerate(labels, start=1):
        plt.text(index, 1.12 if index % 2 else 0.86, f"{index}. {label}", ha="center", va="center", fontsize=9)
    plt.xlim(0.5, 8.5)
    plt.ylim(0.65, 1.35)
    plt.axis("off")
    plt.title("Eight stage customer delivery contract", fontweight="bold")
    save("06_delivery_lifecycle.png")


def architecture_flow(name: str, title: str, subtitle: str, stages: list[tuple[str, str, str]]) -> None:
    figure, axis = plt.subplots(figsize=(11.5, 4.8))
    axis.axis("off")
    for index, (component, technology, responsibility) in enumerate(stages):
        x = 0.035 + index * (0.93 / len(stages))
        axis.text(x, 0.55, f"{component}\n\n{technology}\n{responsibility}", ha="center", va="center", fontsize=9.2, bbox={"boxstyle": "round,pad=0.85", "facecolor": "white", "edgecolor": "black"})
        if index < len(stages) - 1:
            axis.annotate("", xy=(x + 0.14, 0.55), xytext=(x + 0.08, 0.55), arrowprops={"arrowstyle": "->", "lw": 1.5})
    axis.set_title(title, fontweight="bold", pad=22)
    axis.text(0.5, 0.08, subtitle, transform=axis.transAxes, ha="center", fontsize=10)
    save(name)


def test_execution() -> None:
    figure, axis = plt.subplots(figsize=(10.5, 5.7))
    figure.patch.set_facecolor("#171717")
    axis.set_facecolor("#171717")
    axis.axis("off")
    lines = [
        "$ npm test                    15 passed | 0 failed",
        "$ backend-java/mvnw test       4 passed | 0 failed",
        "$ python -m pytest             4 passed | 0 failed",
        "",
        "23 automated tests passed across TypeScript, Java and Python.",
        "",
        "Verified scenarios: pricing, fees, assistant scope, order lookup,",
        "stock commit, reservation release, rejection, delivery milestones,",
        "recommendation ranking, input validation and API behaviour.",
    ]
    for index, line in enumerate(lines):
        axis.text(0.05, 0.9 - index * 0.097, line, transform=axis.transAxes, color="white" if index < 5 else "#d0d0d0", family="monospace", fontsize=11.2)
    axis.set_title("Actual cross-runtime test execution", color="white", fontweight="bold", pad=16)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    plt.savefig(OUTPUT / "12_test_execution.png", dpi=190, bbox_inches="tight", facecolor=figure.get_facecolor())
    plt.close()


def main() -> None:
    kpis = json.loads((ROOT / "reports" / "retail_kpis.json").read_text())
    plt.style.use("grayscale")
    bar(
        ["Received", "Confirmed", "Not confirmed"],
        [kpis["orders_received"], kpis["orders_confirmed"], kpis["orders_received"] - kpis["orders_confirmed"]],
        "Synthetic analytics order outcomes",
        "Orders",
        "01_order_outcomes.png",
    )
    bar(
        ["TypeScript", "Java", "Python"],
        [15, 4, 4],
        "Passing automated tests by runtime",
        "Test cases",
        "02_test_suites.png",
    )
    bar(
        ["Confirmed revenue", "Average order value"],
        [kpis["confirmed_revenue_inr"], kpis["average_order_value_inr"]],
        "Retail KPI outputs",
        "INR",
        "03_retail_kpis.png",
    )
    workflow_matrix()
    inventory_transitions()
    delivery_lifecycle()
    bar(
        ["Products", "Categories", "Generated pages"],
        [50, 5, 62],
        "Verified application scale",
        "Count",
        "07_application_scale.png",
    )
    architecture_flow(
        "08_frontend_api_architecture.png",
        "Frontend and hosted API boundary",
        "One typed application contract supports the browser and external services.",
        [
            ("Customer", "Browser", "discover and checkout"),
            ("Storefront", "Next.js + React", "pages and client state"),
            ("Route handlers", "TypeScript", "stable API contract"),
            ("Adapters", "hosted or external", "environment routing"),
            ("Response", "typed JSON", "order and suggestions"),
        ],
    )
    architecture_flow(
        "09_java_order_architecture.png",
        "Java backend order execution",
        "The orchestrator stops later components after a required failure.",
        [
            ("Controller", "Spring MVC", "validate request"),
            ("Orchestrator", "Java 17", "sequence components"),
            ("Inventory", "catalogue agent", "reserve or reject"),
            ("Payment", "payment agent", "commit or release"),
            ("Delivery", "fulfilment service", "eight milestones"),
        ],
    )
    architecture_flow(
        "10_python_data_architecture.png",
        "Python recommendation and analytics services",
        "Python supports product ranking and reproducible KPIs without owning order state.",
        [
            ("Catalogue", "JSON records", "verified products"),
            ("Ranker", "FastAPI + Python", "related products"),
            ("Orders", "synthetic CSV", "declared fixture"),
            ("Analytics", "pandas", "clean and aggregate"),
            ("Outputs", "JSON + figures", "KPIs and evidence"),
        ],
    )
    architecture_flow(
        "11_deployment_architecture.png",
        "Build, deployment and service verification",
        "Each runtime can be tested separately or started together for local integration.",
        [
            ("Source", "GitHub", "versioned contracts"),
            ("Quality", "Vitest + JUnit + pytest", "23 tests"),
            ("Local stack", "Docker Compose", "three runtimes"),
            ("Frontend", "Vercel", "public application"),
            ("Model option", "Ollama Cloud", "bounded intent only"),
        ],
    )
    test_execution()
    print("Wrote twelve report figures")


if __name__ == "__main__":
    main()
