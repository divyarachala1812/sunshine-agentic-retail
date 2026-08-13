import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BellRing, Boxes, CheckCircle2, CreditCard, PackageOpen, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Agent workflow" };

const agents = [
  {
    name: "Catalogue Agent",
    icon: Boxes,
    input: "Cart items and quantities",
    decision: "Checks availability and reserves stock",
    output: "Reservation or out-of-stock stop",
    tech: "Spring Boot service",
  },
  {
    name: "Risk Agent",
    icon: ShieldCheck,
    input: "Address, order value and payment type",
    decision: "Applies explainable demo risk rules",
    output: "Approved order or manual-review stop",
    tech: "Java policy component",
  },
  {
    name: "Payment Agent",
    icon: CreditCard,
    input: "Reserved order and payment method",
    decision: "Simulates UPI, card or COD authorisation",
    output: "Payment reference or safe decline",
    tech: "Java strategy classes",
  },
  {
    name: "Fulfilment Agent",
    icon: PackageOpen,
    input: "Paid order and Indian PIN code",
    decision: "Calculates delivery fee and date",
    output: "Confirmed shipment plan",
    tech: "Java domain service",
  },
  {
    name: "Notification Agent",
    icon: BellRing,
    input: "Final workflow result and trace",
    decision: "Chooses the correct customer update",
    output: "Order-history and tracking event",
    tech: "Java event component",
  },
];

export default function AgentsPage() {
  return (
    <>
      <section className="agents-hero">
        <div className="shell agents-hero-inner">
          <span className="eyebrow">The system behind Sunshine</span>
          <h1>Small agents. Clear jobs. One reliable order journey.</h1>
          <p>
            Sunshine uses five deterministic software agents. They are not generative AI
            chatbots; each is a bounded backend component that makes one retail decision and
            records what happened for the next component.
          </p>
          <Link className="button button-light" href="/?category=women#catalogue">Try a live order <ArrowRight size={18} /></Link>
        </div>
      </section>

      <section className="shell section-block">
        <div className="section-heading">
          <div><span className="eyebrow">Order orchestration</span><h2>How control moves between agents</h2><p>The orchestrator stops early when a step fails, so no later agent performs unnecessary work.</p></div>
        </div>
        <div className="agent-flow">
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            return (
              <article className="agent-card" key={agent.name}>
                <div className="agent-card-number">0{index + 1}</div>
                <span className="agent-card-icon"><Icon size={27} /></span>
                <h3>{agent.name}</h3>
                <dl>
                  <div><dt>Receives</dt><dd>{agent.input}</dd></div>
                  <div><dt>Decides</dt><dd>{agent.decision}</dd></div>
                  <div><dt>Returns</dt><dd>{agent.output}</dd></div>
                </dl>
                <span className="tech-chip">{agent.tech}</span>
                {index < agents.length - 1 && <ArrowRight className="flow-arrow" size={25} aria-hidden="true" />}
              </article>
            );
          })}
        </div>
      </section>

      <section className="architecture-section">
        <div className="shell architecture-grid">
          <div>
            <span className="eyebrow">Polyglot portfolio</span>
            <h2>Each technology has a reason to be here.</h2>
          </div>
          <div className="architecture-list">
            <article><strong>Frontend</strong><h3>Next.js + React + TypeScript</h3><p>Catalogue, search, cart, checkout and responsive interactions.</p></article>
            <article><strong>Java backend</strong><h3>Spring Boot orchestration</h3><p>Typed order contracts, five bounded agents, failure handling and JUnit tests.</p></article>
            <article><strong>Python backend</strong><h3>FastAPI recommendations</h3><p>Content-based product scoring plus a reproducible retail KPI script.</p></article>
            <article><strong>Deployment</strong><h3>Vercel-compatible adapters</h3><p>The public demo stays functional while preserving the same Java and Python API contracts.</p></article>
          </div>
        </div>
      </section>

      <section className="shell section-block scenarios-section">
        <div className="section-heading"><div><span className="eyebrow">Demonstration paths</span><h2>Test more than the happy path</h2></div></div>
        <div className="scenario-grid">
          <article><CheckCircle2 size={23} /><h3>Successful order</h3><p>All agents complete and a delivery date is returned.</p></article>
          <article><CreditCard size={23} /><h3>Payment declined</h3><p>Stock is released and fulfilment is skipped.</p></article>
          <article><Boxes size={23} /><h3>Out of stock</h3><p>The catalogue agent stops the workflow before payment.</p></article>
        </div>
      </section>
    </>
  );
}
