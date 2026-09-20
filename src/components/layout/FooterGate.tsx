"use client";

import { usePathname } from "next/navigation";

/** Intro gate'te footer gösterme */
export function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <>{children}</>;
}
