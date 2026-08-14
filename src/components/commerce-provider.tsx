"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { demoOrders } from "@/data/demo-orders";
import type { OrderRequest, OrderResponse, Product } from "@/types/commerce";

type StockMap = Record<string, number>;
type CommerceContextValue = {
  orders: OrderResponse[];
  saveOrder: (order: OrderResponse) => void;
  findOrder: (orderId: string) => OrderResponse | undefined;
  getStock: (product: Product) => number;
  consumeStock: (items: OrderRequest["items"]) => void;
  markUnavailable: (productId: string) => void;
  resetDemoActivity: () => void;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);
const ORDER_KEY = "sunshine-orders-v3";
const STOCK_KEY = "sunshine-stock-v2";
const ORDER_EVENT = "sunshine-orders-change";
const STOCK_EVENT = "sunshine-stock-change";
const EMPTY_ORDERS: OrderResponse[] = [];
const EMPTY_STOCK: StockMap = {};
let cachedOrderRaw: string | null = null;
let cachedOrders: OrderResponse[] = EMPTY_ORDERS;
let cachedStockRaw: string | null = null;
let cachedStock: StockMap = EMPTY_STOCK;

function parseStored<T>(raw: string | null, fallback: T): T {
  try { return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}

function getOrderSnapshot() {
  const raw = window.localStorage.getItem(ORDER_KEY);
  if (raw !== cachedOrderRaw) {
    cachedOrders = parseStored(raw, EMPTY_ORDERS);
    cachedOrderRaw = raw;
  }
  return cachedOrders;
}

function getStockSnapshot() {
  const raw = window.localStorage.getItem(STOCK_KEY);
  if (raw !== cachedStockRaw) {
    cachedStock = parseStored(raw, EMPTY_STOCK);
    cachedStockRaw = raw;
  }
  return cachedStock;
}

function subscribe(key: string, eventName: string, onChange: () => void) {
  const storageListener = (event: StorageEvent) => { if (event.key === key) onChange(); };
  window.addEventListener("storage", storageListener);
  window.addEventListener(eventName, onChange);
  return () => {
    window.removeEventListener("storage", storageListener);
    window.removeEventListener(eventName, onChange);
  };
}

function writeOrders(orders: OrderResponse[]) {
  const raw = JSON.stringify(orders.slice(0, 20));
  window.localStorage.setItem(ORDER_KEY, raw);
  cachedOrderRaw = raw;
  cachedOrders = orders.slice(0, 20);
  window.dispatchEvent(new Event(ORDER_EVENT));
}

function writeStock(stock: StockMap) {
  const raw = JSON.stringify(stock);
  window.localStorage.setItem(STOCK_KEY, raw);
  cachedStockRaw = raw;
  cachedStock = stock;
  window.dispatchEvent(new Event(STOCK_EVENT));
}

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const personalOrders = useSyncExternalStore(
    (onChange) => subscribe(ORDER_KEY, ORDER_EVENT, onChange),
    getOrderSnapshot,
    () => EMPTY_ORDERS,
  );
  const stock = useSyncExternalStore(
    (onChange) => subscribe(STOCK_KEY, STOCK_EVENT, onChange),
    getStockSnapshot,
    () => EMPTY_STOCK,
  );
  const orders = useMemo(() => [...personalOrders, ...demoOrders], [personalOrders]);
  const saveOrder = useCallback((order: OrderResponse) => {
    writeOrders([order, ...getOrderSnapshot().filter((item) => item.orderId !== order.orderId)]);
  }, []);
  const findOrder = useCallback(
    (orderId: string) => orders.find((order) => order.orderId === orderId),
    [orders],
  );
  const getStock = useCallback(
    (product: Product) => Math.max(0, stock[product.id] ?? product.stock),
    [stock],
  );
  const consumeStock = useCallback((items: OrderRequest["items"]) => {
    const next = { ...getStockSnapshot() };
    for (const item of items) next[item.productId] = Math.max(0, item.availableStock - item.quantity);
    writeStock(next);
  }, []);
  const markUnavailable = useCallback((productId: string) => {
    writeStock({ ...getStockSnapshot(), [productId]: 0 });
  }, []);
  const resetDemoActivity = useCallback(() => {
    window.localStorage.removeItem(ORDER_KEY);
    window.localStorage.removeItem(STOCK_KEY);
    cachedOrderRaw = null;
    cachedOrders = EMPTY_ORDERS;
    cachedStockRaw = null;
    cachedStock = EMPTY_STOCK;
    window.dispatchEvent(new Event(ORDER_EVENT));
    window.dispatchEvent(new Event(STOCK_EVENT));
  }, []);
  const value = useMemo(
    () => ({ orders, saveOrder, findOrder, getStock, consumeStock, markUnavailable, resetDemoActivity }),
    [orders, saveOrder, findOrder, getStock, consumeStock, markUnavailable, resetDemoActivity],
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) throw new Error("useCommerce must be used within CommerceProvider");
  return context;
}
