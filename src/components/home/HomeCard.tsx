"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export interface HomeCardData {
  id: string;
  title: string;
  href: string;
  preview?: React.ReactNode;
  hoverBg?: string;
}

interface HomeCardProps {
  data: HomeCardData;
  index: number;
}

const CARD_HOVER_BG: Record<string, string> = {
  cinema: "rgba(20,20,24,0.04)",
  books: "rgba(200,180,140,0.06)",
  writing: "rgba(100,100,100,0.03)",
  translations: "rgba(180,170,160,0.05)",
  projects: "rgba(80,120,160,0.04)",
  art: "rgba(180,160,140,0.05)",
};

export function HomeCard({ data, index }: HomeCardProps) {
  const bg = data.hoverBg ?? CARD_HOVER_BG[data.id] ?? "rgba(0,0,0,0.02)";

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="group relative"
    >
      <Link href={data.href} className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 rounded-xl">
        <motion.div
          className="relative overflow-hidden rounded-xl border border-[var(--card-border)]/60 bg-[var(--card)]/80 p-6 transition-colors"
          whileHover={{
            scale: 1.03,
            zIndex: 10,
            backgroundColor: "var(--card)",
            borderColor: "var(--card-border)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
          }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ backgroundColor: bg }}
            aria-hidden
          />
          <div className="relative">
            <h2 className="font-display text-xl font-medium text-[var(--foreground)]">
              {data.title}
            </h2>
            {data.preview && (
              <div className="mt-3 text-sm text-[var(--muted)] line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {data.preview}
              </div>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.article>
  );
}
