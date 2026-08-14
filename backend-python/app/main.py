from fastapi import FastAPI
from pydantic import BaseModel, Field

from .catalogue import Product
from .recommender import recommend_candidates

app = FastAPI(
    title="Sunshine Recommendation Service",
    description="A content based recommender for the Sunshine retail catalogue.",
    version="1.0.0",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": "sunshine-recommendation-service", "status": "UP"}


class ProductInput(BaseModel):
    product_id: str
    slug: str
    category: str
    price: int = Field(gt=0)
    rating: float = Field(ge=0, le=5)


class RecommendationRequest(BaseModel):
    reference: ProductInput
    candidates: list[ProductInput]
    limit: int = Field(default=4, ge=1, le=8)


@app.post("/recommendations")
def recommendations(request: RecommendationRequest) -> dict[str, object]:
    product = Product(**request.reference.model_dump())
    candidates = [Product(**candidate.model_dump()) for candidate in request.candidates]
    ranked = recommend_candidates(product, candidates, request.limit)
    return {
        "reference_product_id": product.product_id,
        "product_ids": [item.product_id for item in ranked],
        "method": "category + rating + price proximity",
    }
