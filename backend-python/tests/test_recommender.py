from fastapi.testclient import TestClient

from app.catalogue import BY_SLUG
from app.main import app
from app.recommender import recommend

client = TestClient(app)


def test_recommendations_stay_in_the_same_category() -> None:
    reference = BY_SLUG["anvi-aarohi-floral-kurta-set"]
    recommendations = recommend(reference)

    assert len(recommendations) == 4
    assert all(product.category == "women" for product in recommendations)
    assert all(product.product_id != reference.product_id for product in recommendations)


def test_recommendations_are_deterministic() -> None:
    reference = BY_SLUG["anvi-aarohi-floral-kurta-set"]

    assert recommend(reference) == recommend(reference)


def test_api_returns_product_ids() -> None:
    reference = BY_SLUG["anvi-aarohi-floral-kurta-set"]
    candidates = [product for product in BY_SLUG.values() if product.category == "women"]
    response = client.post(
        "/recommendations",
        json={
            "reference": reference.__dict__,
            "candidates": [product.__dict__ for product in candidates],
            "limit": 4,
        },
    )

    assert response.status_code == 200
    assert len(response.json()["product_ids"]) == 4


def test_invalid_price_returns_422() -> None:
    response = client.post(
        "/recommendations",
        json={
            "reference": {
                "product_id": "WO-001",
                "slug": "test",
                "category": "women",
                "price": 0,
                "rating": 4.5,
            },
            "candidates": [],
        },
    )

    assert response.status_code == 422
