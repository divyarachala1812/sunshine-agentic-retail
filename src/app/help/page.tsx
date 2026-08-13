import type { Metadata } from "next";
import { CircleHelp, CreditCard, MessageCircle, PackageCheck, RotateCcw, Truck } from "lucide-react";

export const metadata: Metadata = { title: "Help centre" };

const topics = [
  { icon: PackageCheck, title: "Track an order", copy: "Open Recent orders from the profile menu or give Divya an order number for the latest delivery update." },
  { icon: CreditCard, title: "Payment help", copy: "UPI, card and cash on delivery are simulated. The demonstration never makes a real charge." },
  { icon: Truck, title: "Delivery", copy: "Product estimates and confirmed-order dates are shown in Indian local time for the demonstration address." },
  { icon: RotateCcw, title: "Returns", copy: "The storefront demonstrates a seven-day return policy; no physical fulfilment or returns are performed." },
];

export default function HelpPage() {
  return (
    <section className="shell support-page">
      <div className="support-page-hero"><span><CircleHelp size={34} /></span><div><span className="eyebrow">Sunshine support</span><h1>How can we help?</h1><p>Get quick answers here or start a conversation with Divya for product and order support.</p><button className="button button-primary" data-open-assistant type="button"><MessageCircle size={18} /> Chat with Divya</button></div></div>
      <div className="support-topic-grid">{topics.map(({ icon: Icon, title, copy }) => <article key={title}><Icon size={24} /><h2>{title}</h2><p>{copy}</p></article>)}</div>
    </section>
  );
}
