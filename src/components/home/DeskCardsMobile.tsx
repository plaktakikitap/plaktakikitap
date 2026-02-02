"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { DeskCardData } from "./DeskCard";

interface DeskCardsMobileProps {
  cards: DeskCardData[];
}

export function DeskCardsMobile({ cards }: DeskCardsMobileProps) {
  return (
    <div className="flex flex-col gap-3 px-4 py-8 md:hidden">
      {cards.map((card, i) => (
        <motion.article
          key={card.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
        >
          <Link
            href={card.href}
            className="block rounded-sm bg-white/90 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/20"
          >
            <h2 className="font-display text-base font-medium text-[var(--foreground)]">
              {card.title}
            </h2>
            {card.preview && (
              <div className="mt-1.5 text-sm text-[var(--muted)] line-clamp-2">
                {card.preview}
              </div>
            )}
          </Link>
        </motion.article>
      ))}
    </div>
  );
}
