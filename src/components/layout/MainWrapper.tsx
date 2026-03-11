"use client";

import { usePathname } from "next/navigation";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/home";

  return (
    <main
      className={
        isHome
          ? "flex min-h-screen flex-col"
          : "flex min-h-screen flex-col pt-12 md:pt-14"
      }
      style={
        isHome
          ? undefined
          : { paddingTop: "max(3rem, env(safe-area-inset-top, 0px) + 2.5rem)" }
      }
    >
      {children}
    </main>
  );
}
