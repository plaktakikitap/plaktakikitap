"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageViewBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/secretgate") || pathname.startsWith("/api")) {
      return;
    }
    try {
      const stamp = Math.floor(Date.now() / 30_000);
      const key = `pv:${pathname}:${stamp}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* private mode */
    }
    void fetch("/api/gorunum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ yol: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
