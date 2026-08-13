"use client";

import Link from "next/link";
import { ArrowRight, Check, MessageCircle, Minus, Send, ShoppingBag, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { OPEN_ASSISTANT_EVENT } from "@/components/account-menu";
import { useCart } from "@/components/cart-provider";
import { useCommerce } from "@/components/commerce-provider";
import { ProductVisual } from "@/components/product-visual";
import { products } from "@/data/products";
import { formatInr } from "@/lib/format";
import type { AssistantMessage, AssistantReply } from "@/types/assistant";
import type { Product } from "@/types/commerce";

type ConversationMessage = AssistantMessage & { reply?: AssistantReply };

const welcome: ConversationMessage = {
  role: "assistant",
  content: "Hi, I’m Divya. I can help you find the right product, choose a size, manage your cart, or track a Sunshine order.",
};

function AssistantProduct({ product, suggestedSize }: { product: Product; suggestedSize?: string }) {
  const { addItem } = useCart();
  const { getStock } = useCommerce();
  const stock = getStock(product);
  const suggested = suggestedSize && product.sizes?.includes(suggestedSize) ? suggestedSize : product.sizes?.[0];
  const [size, setSize] = useState(suggested);
  const [added, setAdded] = useState(false);

  const add = () => {
    if (stock === 0) return;
    addItem(product, size);
    setAdded(true);
  };

  return (
    <article className="assistant-product">
      <Link href={`/products/${product.slug}`}><ProductVisual product={product} /></Link>
      <div className="assistant-product-copy">
        <Link href={`/products/${product.slug}`}><strong>{product.name}</strong></Link>
        <span>{formatInr(product.price)} · {product.rating}★</span>
        <small className={stock <= 3 ? "assistant-low-stock" : ""}>{stock === 0 ? "Unavailable" : stock <= 3 ? `Only ${stock} left` : "In stock"}</small>
        {product.sizes?.length ? (
          <label>Size
            <select aria-label={`Size for ${product.name}`} value={size} onChange={(event) => { setSize(event.target.value); setAdded(false); }}>
              {product.sizes.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </label>
        ) : null}
        <button disabled={stock === 0} onClick={add} type="button">
          {added ? <Check size={15} /> : <ShoppingBag size={15} />}
          {stock === 0 ? "Unavailable" : added ? "Added to cart" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}

export function CustomerAssistant() {
  const { lines } = useCart();
  const { orders, getStock } = useCommerce();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([welcome]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener(OPEN_ASSISTANT_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open, pending]);

  const sendMessage = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content || pending) return;
    const userMessage: ConversationMessage = { role: "user", content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setPending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: messageContent }) => ({ role, content: messageContent })),
          orders,
          cart: lines.map((line) => ({
            productId: line.product.id,
            name: line.product.name,
            quantity: line.quantity,
            selectedSize: line.selectedSize,
          })),
          inventory: products.map((product) => ({ productId: product.id, availableStock: getStock(product) })),
        }),
      });
      const reply = (await response.json()) as AssistantReply & { error?: string };
      if (!response.ok) throw new Error(reply.error ?? "Support is unavailable");
      setMessages((current) => [...current, { role: "assistant", content: reply.message, reply }]);
    } catch {
      setMessages((current) => [...current, {
        role: "assistant",
        content: "I couldn’t connect just now. You can still browse the catalogue, open your cart, or check recent orders from the profile menu.",
        reply: { message: "", products: [], quickReplies: ["Try again", "What is in my cart?"], actions: [], source: "sunshine" },
      }]);
    } finally {
      setPending(false);
    }
  }, [getStock, lines, messages, orders, pending]);

  return (
    <div className={`assistant-shell ${open ? "assistant-open" : ""}`}>
      {open ? (
        <section aria-label="Divya shopping assistant" aria-live="polite" className="assistant-panel">
          <header className="assistant-header">
            <span className="assistant-avatar"><Sparkles size={20} /></span>
            <div><strong>Divya</strong><small>Sunshine shopping support</small></div>
            <button aria-label="Close assistant" onClick={() => setOpen(false)} type="button"><X size={20} /></button>
          </header>
          <div className="assistant-privacy"><span /> Product and order answers use verified Sunshine data</div>
          <div className="assistant-conversation" ref={scrollRef}>
            {messages.map((message, index) => (
              <div className={`assistant-message assistant-${message.role}`} key={`${message.role}-${index}`}>
                <p>{message.content}</p>
                {message.reply?.products.length ? (
                  <div className="assistant-products">
                    {message.reply.products.map((product) => <AssistantProduct key={product.id} product={product} suggestedSize={message.reply?.suggestedSize} />)}
                  </div>
                ) : null}
                {message.reply?.actions.length ? (
                  <div className="assistant-actions">
                    {message.reply.actions.map((action) => <Link href={action.href} key={`${action.kind}-${action.href}`}>{action.label} <ArrowRight size={14} /></Link>)}
                  </div>
                ) : null}
                {message.reply?.quickReplies.length && index === messages.length - 1 ? (
                  <div className="assistant-quick-replies">
                    {message.reply.quickReplies.map((reply) => <button disabled={pending} onClick={() => void sendMessage(reply)} type="button" key={reply}>{reply}</button>)}
                  </div>
                ) : null}
              </div>
            ))}
            {pending ? <div className="assistant-message assistant-assistant assistant-thinking"><span /><span /><span /></div> : null}
          </div>
          <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); void sendMessage(input); }}>
            <input aria-label="Message Divya" maxLength={800} onChange={(event) => setInput(event.target.value)} placeholder="Ask for products, sizes or an order…" value={input} />
            <button aria-label="Send message" disabled={pending || !input.trim()} type="submit"><Send size={18} /></button>
          </form>
          <footer><Link href="/cart"><ShoppingBag size={14} /> Cart ({lines.reduce((total, line) => total + line.quantity, 0)})</Link><button onClick={() => setMessages([welcome])} type="button"><Minus size={14} /> Clear chat</button></footer>
        </section>
      ) : (
        <button className="assistant-launcher" onClick={() => setOpen(true)} type="button">
          <span><MessageCircle size={22} /></span>
          <span><strong>Need help?</strong><small>Chat with Divya</small></span>
        </button>
      )}
    </div>
  );
}
