from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "reports" / "figures"


def save(name: str) -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    plt.tight_layout()
    plt.savefig(OUTPUT / name, dpi=180, bbox_inches="tight")
    plt.close()


def bar(
    labels: list[str], values: list[float], title: str, ylabel: str, name: str
) -> None:
    plt.figure(figsize=(8.5, 4.8))
    bars = plt.bar(labels, values, color="0.72", edgecolor="black")
    plt.bar_label(bars, fmt="%.1f" if max(values) <= 100 else "%.0f")
    plt.title(title)
    plt.ylabel(ylabel)
    plt.xticks(rotation=12)
    save(name)


def main() -> None:
    kpis = json.loads((ROOT / "reports" / "retail_kpis.json").read_text())
    plt.style.use("grayscale")
    bar(
        ["Received", "Confirmed", "Not confirmed"],
        [
            kpis["orders_received"],
            kpis["orders_confirmed"],
            kpis["orders_received"] - kpis["orders_confirmed"],
        ],
        "Synthetic order outcomes",
        "Orders",
        "01_order_outcomes.png",
    )
    bar(
        ["Frontend Vitest", "Java JUnit", "Python pytest"],
        [15, 4, 4],
        "Automated test coverage by runtime",
        "Passing test cases",
        "02_test_suites.png",
    )
    bar(
        ["Confirmed revenue", "Average order value"],
        [kpis["confirmed_revenue_inr"], kpis["average_order_value_inr"]],
        "Retail KPI outputs",
        "INR",
        "03_retail_kpis.png",
    )
    labels = ["Success", "Payment failure", "Out of stock"]
    completed = [5, 3, 1]
    failed = [0, 1, 1]
    skipped = [0, 1, 3]
    plt.figure(figsize=(8.5, 4.8))
    plt.bar(labels, completed, label="Completed", color="0.82", edgecolor="black")
    plt.bar(
        labels,
        failed,
        bottom=completed,
        label="Failed",
        color="0.50",
        edgecolor="black",
    )
    lower = [
        complete + failure for complete, failure in zip(completed, failed, strict=True)
    ]
    plt.bar(
        labels, skipped, bottom=lower, label="Skipped", color="0.25", edgecolor="black"
    )
    plt.title("Exact workflow trace status by order scenario")
    plt.ylabel("Workflow steps")
    plt.legend()
    save("04_workflow_paths.png")
    bar(
        ["Products", "Categories", "Generated pages"],
        [50, 5, 63],
        "Application scale checks",
        "Count",
        "05_application_scale.png",
    )
    print("Wrote five report figures")


if __name__ == "__main__":
    main()
