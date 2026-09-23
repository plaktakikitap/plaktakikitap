"use client";

import Link from "next/link";
import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { NavCardItem } from "@/components/home/nav-cards";
import { NavCardIllustration } from "@/components/home/NavCardIllustration";
import { cn } from "@/lib/utils";

export function NavCard({
  card,
  className,
}: {
  card: NavCardItem;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={card.href}
      className={cn(
        "group relative flex h-full min-h-[160px] flex-col overflow-hidden rounded-2xl border border-rule bg-[#FDFAF5] p-5 transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_12px_32px_rgba(26,22,18,0.1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40",
        card.featured && "min-h-[200px] sm:min-h-[220px] sm:flex-row sm:items-center sm:gap-6 sm:p-6",
        className
      )}
      style={{
        transform:
          hovered && !reduceMotion ? "translateY(-4px)" : undefined,
        boxShadow: hovered
          ? "0 14px 36px rgba(26,22,18,0.12)"
          : "0 2px 8px rgba(26,22,18,0.04)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div
        className={cn(
          "mb-4 flex shrink-0 items-center justify-center",
          card.featured && "mb-0 sm:mb-0 sm:w-[42%]"
        )}
      >
        <NavCardIllustration
          visual={card.visual}
          className={
            card.featured
              ? "h-20 w-28 sm:h-24 sm:w-36"
              : "h-14 w-14"
          }
        />
      </div>

      <div
        className={cn(
          "mt-auto flex min-w-0 flex-col gap-1",
          card.featured && "sm:mt-0 sm:flex-1 sm:justify-center"
        )}
      >
        <span className="font-sans text-[1.05rem] font-semibold leading-snug tracking-tight text-ink">
          {card.title}
        </span>
        {card.subtitle ? (
          <span className="line-clamp-2 font-sans text-[0.8rem] font-normal leading-[1.5] text-ink-muted">
            {card.subtitle}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
