"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Search, ShoppingBag } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { AccountMenu } from "@/components/account-menu";
import { useCart } from "@/components/cart-provider";
import { categories } from "@/data/products";
import { formatInr } from "@/lib/format";
import { getProductSearchSuggestions } from "@/lib/product-search";

export function Header() {
  const { itemCount } = useCart();
  const router = useRouter();
  const listboxId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const suggestions = getProductSearchSuggestions(query);
  const hasQuery = Boolean(query.trim());

  useEffect(() => {
    const closeWhenOutside = (event: PointerEvent) => {
      if (!formRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("pointerdown", closeWhenOutside);
    return () => document.removeEventListener("pointerdown", closeWhenOutside);
  }, []);

  const selectProduct = (index: number) => {
    const product = suggestions[index];
    if (!product) return;
    setQuery(product.name);
    setIsOpen(false);
    setActiveIndex(-1);
    router.push(`/products/${product.slug}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!isOpen || !suggestions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1,
      );
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectProduct(activeIndex);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (isOpen && activeIndex >= 0) {
      event.preventDefault();
      selectProduct(activeIndex);
    }
  };

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
        <form
          className="search-form"
          action="/"
          onSubmit={handleSubmit}
          ref={formRef}
          role="search"
        >
          <Search size={20} aria-hidden="true" />
          <input
            aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={isOpen && hasQuery}
            aria-label="Search Sunshine"
            autoComplete="off"
            name="q"
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(Boolean(event.target.value.trim()));
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(hasQuery)}
            onKeyDown={handleKeyDown}
            placeholder="Search kurtas, shoes, laptops and more"
            role="combobox"
            type="search"
            value={query}
          />
          <button type="submit">Search</button>
          {isOpen && hasQuery && (
            <div className="search-suggestions" id={listboxId} role="listbox">
              {suggestions.length ? (
                suggestions.map((product, index) => (
                  <button
                    aria-selected={activeIndex === index}
                    className={activeIndex === index ? "active" : ""}
                    id={`${listboxId}-${index}`}
                    key={product.id}
                    onClick={() => selectProduct(index)}
                    onMouseEnter={() => setActiveIndex(index)}
                    role="option"
                    type="button"
                  >
                    <span>
                      <strong>{product.name}</strong>
                      <small>{product.brand} · {product.categoryLabel}</small>
                    </span>
                    <b>{formatInr(product.price)}</b>
                  </button>
                ))
              ) : (
                <div className="search-no-results" role="option" aria-disabled="true" aria-selected="false">
                  <strong>No products found</strong>
                  <span>Try another product name or category.</span>
                </div>
              )}
            </div>
          )}
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
