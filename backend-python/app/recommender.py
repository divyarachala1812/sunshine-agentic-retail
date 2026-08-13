from __future__ import annotations

from .catalogue import PRODUCTS, Product


def similarity_score(reference: Product, candidate: Product) -> float:
    """Rank same-category products using rating and relative price proximity."""
    if reference.category != candidate.category:
        return float("-inf")

    relative_price_distance = abs(reference.price - candidate.price) / max(reference.price, 1)
    return candidate.rating * 2 - relative_price_distance


def recommend(reference: Product, limit: int = 4) -> list[Product]:
    candidates = [
        product
        for product in PRODUCTS
        if product.product_id != reference.product_id and product.category == reference.category
    ]
    return recommend_candidates(reference, candidates, limit)


def recommend_candidates(reference: Product, candidates: list[Product], limit: int = 4) -> list[Product]:
    eligible = [
        product
        for product in candidates
        if product.product_id != reference.product_id and product.category == reference.category
    ]
    return sorted(
        eligible,
        key=lambda product: similarity_score(reference, product),
        reverse=True,
    )[:limit]
