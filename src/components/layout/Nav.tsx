"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/home";

  // No navbar on intro gate or main homepage
  if (isHome) return null;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-transparent bg-transparent transition-colors duration-300"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex h-12 max-w-6xl items-center px-4 md:h-14 md:px-6">
        <Link
          href="/home"
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          aria-label="Ana sayfaya dön"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          Ana Sayfa
        </Link>
      </div>
    </nav>
  );
}
