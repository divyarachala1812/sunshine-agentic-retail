"use client";

import Link from "next/link";
import { ChevronDown, CircleHelp, Clock3, MessageCircle, Settings, UserRound } from "lucide-react";

export const OPEN_ASSISTANT_EVENT = "sunshine-open-assistant";

export function AccountMenu() {
  const openAssistant = () => {
    window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT));
    document.querySelector<HTMLDetailsElement>(".account-menu")?.removeAttribute("open");
  };

  return (
    <details className="account-menu">
      <summary aria-label="Open profile menu">
        <UserRound size={21} />
        <span>Divya</span>
        <ChevronDown size={15} aria-hidden="true" />
      </summary>
      <div className="account-popover">
        <div className="account-identity">
          <span>DR</span>
          <div><strong>Divya Rachala</strong><small>Sunshine Demo member</small></div>
        </div>
        <nav aria-label="Profile menu">
          <Link href="/profile"><UserRound size={17} /><span><strong>Profile</strong><small>Details and preferences</small></span></Link>
          <Link href="/profile#orders"><Clock3 size={17} /><span><strong>Recent orders</strong><small>Track purchases and delivery</small></span></Link>
          <Link href="/account"><Settings size={17} /><span><strong>Account</strong><small>Delivery and shopping settings</small></span></Link>
          <button onClick={openAssistant} type="button"><MessageCircle size={17} /><span><strong>Chat with Divya</strong><small>Shopping and order support</small></span></button>
          <Link href="/help"><CircleHelp size={17} /><span><strong>Help centre</strong><small>Payments, delivery and returns</small></span></Link>
        </nav>
      </div>
    </details>
  );
}
