import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { ProductActions } from "@/components/product-actions";
import { ProductVisual } from "@/components/product-visual";
import { Recommendations } from "@/components/recommendations";
import { getProduct, products } from "@/data/products";
import { discountPercent, formatInr } from "@/lib/format";

type ProductPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return product
    ? { title: product.name, description: product.description }
    : { title: "Product not found" };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const fallbackRecommendations = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <>
      <div className="shell breadcrumb">
        <Link href="/">Home</Link><ChevronRight size={14} />
        <Link href={`/?category=${product.category}#catalogue`}>{product.categoryLabel}</Link>
        <ChevronRight size={14} /><span>{product.name}</span>
      </div>
      <section className="shell product-detail">
        <ProductVisual product={product} large />
        <div className="product-detail-copy">
          <span className="product-brand">{product.brand}</span>
          <h1>{product.name}</h1>
          <div className="detail-rating">
            <span><Star size={15} fill="currentColor" /> {product.rating}</span>
            <p>{product.reviews.toLocaleString("en-IN")} verified ratings</p>
          </div>
          <p className="detail-description">{product.description}</p>
          <div className="detail-price">
            <strong>{formatInr(product.price)}</strong>
            <del>{formatInr(product.mrp)}</del>
            <span>{discountPercent(product.price, product.mrp)}% off</span>
          </div>
          <p className="tax-note">Inclusive of all taxes</p>
          <div className="colour-row"><span>Colour</span><strong>{product.colour}</strong></div>
          <ProductActions product={product} />
          <div className="service-grid">
            <div><Truck size={21} /><span><strong>{product.deliveryDays}–{product.deliveryDays + 2} days</strong>Estimated delivery</span></div>
            <div><RotateCcw size={21} /><span><strong>7-day returns</strong>Unused items only</span></div>
            <div><ShieldCheck size={21} /><span><strong>Secure demo</strong>No real charge</span></div>
          </div>
        </div>
      </section>
      <Recommendations slug={product.slug} fallback={fallbackRecommendations} />
    </>
  );
}
