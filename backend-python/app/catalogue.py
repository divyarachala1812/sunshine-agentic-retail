from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Product:
    product_id: str
    slug: str
    category: str
    price: int
    rating: float


# This compact service catalogue mirrors the featured products used by the web app.
# A production system would read these records from a shared database.
PRODUCTS = [
    Product("WO-001", "anvi-aarohi-floral-kurta-set", "women", 1499, 4.5),
    Product("WO-002", "nila-meher-cotton-midi-dress", "women", 1199, 4.3),
    Product("WO-003", "vastra-noor-chanderi-saree", "women", 2399, 4.6),
    Product("WO-004", "anvi-tara-straight-kurta", "women", 799, 4.2),
    Product("WO-005", "nila-ira-linen-co-ord-set", "women", 1899, 4.4),
    Product("WO-006", "vastra-ruhani-anarkali-set", "women", 2799, 4.7),
    Product("ME-001", "northlane-arjun-oxford-shirt", "men", 1099, 4.4),
    Product("ME-002", "aangan-kabir-linen-kurta", "men", 1299, 4.5),
    Product("ME-003", "drift-rohan-tapered-jeans", "men", 1499, 4.3),
    Product("FO-001", "stride-aero-everyday-sneakers", "footwear", 1799, 4.4),
    Product("FO-002", "eloise-mira-block-heel-sandals", "footwear", 1299, 4.3),
    Product("FO-003", "karigar-jodhpur-leather-jutti", "footwear", 999, 4.5),
    Product("EL-001", "astra-nova-5g-smartphone", "electronics", 18999, 4.4),
    Product("EL-002", "veda-book-air-14-laptop", "electronics", 54990, 4.5),
    Product("EL-003", "sonic-pulse-anc-earbuds", "electronics", 2499, 4.3),
    Product("HO-001", "nivasa-saanjh-cotton-bedsheet", "home", 1199, 4.5),
    Product("HO-002", "mitti-aroma-ceramic-diffuser", "home", 899, 4.3),
    Product("HO-003", "mitti-chai-stoneware-set", "home", 999, 4.6),
]

BY_SLUG = {product.slug: product for product in PRODUCTS}
