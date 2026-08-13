"use client";

import Link from "next/link";
import { MapPin, Search, ShoppingBag } from "lucide-react";
import { AccountMenu } from "@/components/account-menu";
import { useCart } from "@/components/cart-provider";
import { categories } from "@/data/products";

export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="site-header">
      <div className="delivery-strip">
        <div className="shell delivery-strip-inner">
          <span><MapPin size={15} /> Delivering to Hyderabad 500081</span>
          <span>Free delivery above ₹999 · Easy 7-day returns</span>
        </div>
      </div>
      <div className="shell header-main">
        <Link className="brand" href="/" aria-label="Sunshine home">
          <span className="brand-sun" aria-hidden="true">☀</span>
          <span>sunshine</span>
        </Link>
        <form className="search-form" action="/" role="search">
          <Search size={20} aria-hidden="true" />
          <input
            aria-label="Search Sunshine"
            name="q"
            placeholder="Search kurtas, shoes, laptops and more"
            type="search"
          />
          <button type="submit">Search</button>
        </form>
        <nav className="header-actions" aria-label="Account and cart">
          <AccountMenu />
          <Link className="cart-link" href="/cart" aria-label={`Cart with ${itemCount} items`}>
            <ShoppingBag size={22} />
            <span>Cart</span>
            {itemCount > 0 && <b>{itemCount}</b>}
          </Link>
        </nav>
      </div>
      <nav className="category-nav shell" aria-label="Product categories">
        <Link href="/">Home</Link>
        {categories.map((category) => (
          <Link href={`/?category=${category.id}#catalogue`} key={category.id}>
            {category.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
