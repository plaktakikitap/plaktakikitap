"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AramaKutusu } from "@/components/AramaKutusu";

export function Nav() {
  const pathname = usePathname();

  // Admin paneli kendi nav'ına sahip
  if (pathname.startsWith("/secretgate")) return null;

  const isHome = pathname === "/" || pathname === "/home";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-transparent bg-transparent transition-colors duration-300"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 px-4 md:h-14 md:px-6">
        <Link
          href="/home"
          className="group relative z-10 -mb-5 flex shrink-0 flex-col items-center"
          aria-label={isHome ? "Eymen" : "Ana sayfaya dön"}
        >
          {/* İnce iplik */}
          <span
            aria-hidden
            className="h-2.5 w-px bg-[rgba(192,160,96,0.55)] transition group-hover:bg-[rgba(192,160,96,0.85)]"
          />
          <span
            aria-hidden
            className="mb-0.5 h-1 w-1 rounded-full bg-[rgba(192,160,96,0.7)] shadow-[0_0_4px_rgba(192,160,96,0.4)]"
          />
          <Image
            src="/images/eymen-studio.jpg"
            alt=""
            width={40}
            height={40}
            className="h-8 w-8 rotate-[-8deg] rounded-[5px] border border-[rgba(232,224,208,0.35)] object-cover shadow-[0_4px_14px_rgba(0,0,0,0.45)] transition duration-300 group-hover:rotate-[-3deg] group-hover:scale-105 md:h-9 md:w-9"
            priority
          />
        </Link>
        <AramaKutusu />
      </div>
    </nav>
  );
}
