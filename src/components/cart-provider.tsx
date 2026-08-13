"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import type { CartLine, Product } from "@/types/commerce";

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  isReady: boolean;
  addItem: (product: Product, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  removeItem: (productId: string, selectedSize?: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "sunshine-cart-v1";
const CART_EVENT = "sunshine-cart-change";
const EMPTY_CART: CartLine[] = [];
let cachedRaw: string | null = null;
let cachedLines: CartLine[] = EMPTY_CART;

const lineKey = (productId: string, selectedSize?: string) =>
  `${productId}:${selectedSize ?? "default"}`;

function getCartSnapshot(): CartLine[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedLines;
  try {
    cachedLines = raw ? (JSON.parse(raw) as CartLine[]) : EMPTY_CART;
  } catch {
    cachedLines = EMPTY_CART;
  }
  cachedRaw = raw;
  return cachedLines;
}

function subscribeToCart(onChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(CART_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CART_EVENT, onChange);
  };
}

function writeCart(lines: CartLine[]) {
  const raw = JSON.stringify(lines);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedLines = lines;
  window.dispatchEvent(new Event(CART_EVENT));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribeToCart, getCartSnapshot, () => EMPTY_CART);

  const addItem = useCallback((product: Product, selectedSize?: string) => {
    const current = getCartSnapshot();
    const key = lineKey(product.id, selectedSize);
    const existing = current.find(
      (line) => lineKey(line.product.id, line.selectedSize) === key,
    );
    writeCart(
      existing
        ? current.map((line) =>
            lineKey(line.product.id, line.selectedSize) === key
              ? { ...line, quantity: Math.min(line.quantity + 1, 5) }
              : line,
          )
        : [...current, { product, quantity: 1, selectedSize }],
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, selectedSize?: string) => {
      const current = getCartSnapshot();
      const key = lineKey(productId, selectedSize);
      writeCart(
        quantity <= 0
          ? current.filter((line) => lineKey(line.product.id, line.selectedSize) !== key)
          : current.map((line) =>
              lineKey(line.product.id, line.selectedSize) === key
                ? { ...line, quantity: Math.min(quantity, 5) }
                : line,
            ),
      );
    },
    [],
  );

  const removeItem = useCallback((productId: string, selectedSize?: string) => {
    const key = lineKey(productId, selectedSize);
    writeCart(getCartSnapshot().filter((line) => lineKey(line.product.id, line.selectedSize) !== key));
  }, []);

  const clearCart = useCallback(() => writeCart(EMPTY_CART), []);
  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);
  const value = useMemo(
    () => ({ lines, itemCount, isReady: true, addItem, updateQuantity, removeItem, clearCart }),
    [lines, itemCount, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
