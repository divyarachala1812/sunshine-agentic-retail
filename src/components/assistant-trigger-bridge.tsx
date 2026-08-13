"use client";

import { useEffect } from "react";
import { OPEN_ASSISTANT_EVENT } from "@/components/account-menu";

export function AssistantTriggerBridge() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (target?.closest("[data-open-assistant]")) window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
