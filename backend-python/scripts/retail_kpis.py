from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
orders = pd.read_csv(ROOT / "data" / "sample_orders.csv", parse_dates=["order_date"])
confirmed = orders.loc[orders["status"] == "CONFIRMED"].copy()

summary = {
    "orders_received": int(len(orders)),
    "orders_confirmed": int(len(confirmed)),
    "confirmation_rate_pct": round(len(confirmed) / len(orders) * 100, 1),
    "confirmed_revenue_inr": int(confirmed["subtotal"].sum()),
    "average_order_value_inr": round(confirmed["subtotal"].mean(), 2),
    "top_city": confirmed.groupby("city")["subtotal"].sum().idxmax(),
    "top_category": confirmed.groupby("category")["subtotal"].sum().idxmax(),
}

output = ROOT.parent / "reports" / "retail_kpis.json"
output.write_text(pd.Series(summary).to_json(indent=2), encoding="utf-8")
print(pd.Series(summary).to_string())
print(f"\nSaved {output}")
