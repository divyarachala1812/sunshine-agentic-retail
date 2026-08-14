from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

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
    axis.imshow(values, cmap="Greys", vmin=0, vmax=2, aspect="auto")
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
    print("Wrote seven report figures")


if __name__ == "__main__":
    main()
