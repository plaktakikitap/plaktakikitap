"use client";

import { usePathname } from "next/navigation";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/home";

  return (
    <main className={isHome ? "" : "pt-14"}>
      {children}
    </main>
  );
}
