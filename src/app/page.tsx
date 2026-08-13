import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, MessageCircle, Truck } from "lucide-react";
import { CategoryArtwork } from "@/components/category-artwork";
import { ProductCard } from "@/components/product-card";
import { categories, featuredProducts, products } from "@/data/products";
import type { CategoryId } from "@/types/commerce";

type HomeProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { q = "", category = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const selectedCategory = categories.some((item) => item.id === category)
    ? (category as CategoryId)
    : null;
  const visibleProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch =
      !query ||
      [product.name, product.brand, product.categoryLabel, product.description]
        .join(" ")
        .toLowerCase()
        .includes(query);
    return matchesCategory && matchesSearch;
  });
  const isFiltered = Boolean(query || selectedCategory);

  return (
    <>
      {!isFiltered && (
        <section className="hero shell">
          <div className="hero-copy">
            <span className="eyebrow">The Sunshine edit · India</span>
            <h1>Good finds for bright, everyday living.</h1>
            <p>
              Fashion, electronics and home essentials selected for Indian homes,
              college days and first jobs.
            </p>
            <div className="button-row">
              <Link className="button button-primary" href="/?category=women#catalogue">
                Shop fashion <ArrowRight size={18} />
              </Link>
              <button className="button button-secondary" data-open-assistant type="button">
                Ask Divya for help
              </button>
            </div>
            <div className="hero-notes">
              <span><Truck size={17} /> Free delivery over ₹999</span>
              <span><BadgeIndianRupee size={17} /> Prices include GST</span>
            </div>
          </div>
          <div className="hero-art" aria-label="Sunshine fashion collection">
            <div className="sun-orbit" />
            <div className="fashion-card fashion-card-left">
              <span>Everyday kurtas</span>
              <strong>from ₹599</strong>
            </div>
            <div className="fashion-silhouette" aria-hidden="true">
              <span className="head" />
              <span className="dress" />
            </div>
            <div className="fashion-card fashion-card-right">
              <span>Fresh arrivals</span>
              <strong>50 thoughtful picks</strong>
            </div>
          </div>
        </section>
      )}

      {!isFiltered && (
        <section className="shell section-block" aria-labelledby="categories-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Shop your way</span>
              <h2 id="categories-title">Explore categories</h2>
            </div>
          </div>
          <div className="category-grid">
            {categories.map((item) => (
              <Link
                className="category-card"
                href={`/?category=${item.id}#catalogue`}
                key={item.id}
                style={{ background: item.colour }}
              >
                <CategoryArtwork category={item.id} />
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.eyebrow}</span>
                </div>
                <ArrowRight size={20} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="shell section-block" id="catalogue" aria-labelledby="catalogue-title">
        <div className="section-heading catalogue-heading">
          <div>
            <span className="eyebrow">{isFiltered ? "Your results" : "Popular right now"}</span>
            <h2 id="catalogue-title">
              {query
                ? `Results for “${q.trim()}”`
                : selectedCategory
                  ? categories.find((item) => item.id === selectedCategory)?.label
                  : "Customer favourites"}
            </h2>
            <p>{visibleProducts.length} products · prices in Indian rupees</p>
          </div>
          {isFiltered && (
            <Link className="text-link" href="/#catalogue">
              Clear filters
            </Link>
          )}
        </div>
        {visibleProducts.length ? (
          <div className="product-grid">
            {(isFiltered ? visibleProducts : featuredProducts).map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        ) : (
          <div className="empty-panel">
            <h3>No exact match yet</h3>
            <p>Try a simpler search such as kurta, laptop, shoes or home.</p>
            <Link className="button button-primary" href="/">Browse all products</Link>
          </div>
        )}
      </section>

      {!isFiltered && (
        <section className="support-band">
          <div className="shell support-band-inner">
            <div className="support-band-icon"><MessageCircle size={28} /></div>
            <div>
              <span className="eyebrow">Personal shopping support</span>
              <h2>Tell Divya what you need in your own words.</h2>
              <p>
                Ask for recommendations by style, size and budget, add a product from the
                conversation, review your cart, or track an order by number.
              </p>
            </div>
            <button className="button button-light" data-open-assistant type="button">Chat with Divya <ArrowRight size={18} /></button>
          </div>
        </section>
      )}
    </>
  );
}
