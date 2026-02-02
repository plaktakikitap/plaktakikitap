"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/" || pathname === "/home";

  // No navbar on intro gate or main homepage
  if (isHome) return null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isHome
          ? "border-transparent bg-transparent"
          : "border-b border-[var(--card-border)]/40 bg-[var(--background)]/70 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 md:h-14">
        <Link
          href="/home"
          className={`font-display text-lg font-medium tracking-tight ${
            isHome ? "text-[var(--foreground)]/90" : "text-[var(--foreground)]"
          }`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          plaktakikitap
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/home"
            className="text-xs uppercase tracking-widest text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Ana Sayfa
          </Link>
          <Link
            href="/admin"
            className={`text-xs uppercase tracking-widest transition-colors ${
              isAdmin ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
