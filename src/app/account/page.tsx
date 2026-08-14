import type { Metadata } from "next";
import Link from "next/link";
import { Bell, MapPin, ShieldCheck, UserRound } from "lucide-react";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <section className="shell account-page">
      <div className="page-heading"><span className="eyebrow">Shopping settings</span><h1>Your account</h1><p>Preferences for your Sunshine shopping journey.</p></div>
      <div className="account-settings-grid">
        <article><UserRound size={23} /><div><h2>Personal details</h2><p>Divya Rachala · Sunshine Demo member</p></div><Link href="/profile">View profile</Link></article>
        <article><MapPin size={23} /><div><h2>Delivery location</h2><p>Hyderabad 500081 · India</p></div><span>Default</span></article>
        <article><Bell size={23} /><div><h2>Order updates</h2><p>Updates appear in this browser’s recent-order centre.</p></div><span>Enabled</span></article>
        <article><ShieldCheck size={23} /><div><h2>Privacy</h2><p>Cart, personal orders and stock changes remain in local browser storage.</p></div><span>Browser only</span></article>
      </div>
    </section>
  );
}
