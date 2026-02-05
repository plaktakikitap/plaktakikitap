"use client";

import { motion } from "framer-motion";
import type { TranslationIndependentRow } from "@/types/database";
import { GraduationCap, ExternalLink } from "lucide-react";

function hasAcademiaTag(item: TranslationIndependentRow) {
  return item.tags?.some((t) => t.toLowerCase() === "academia") ?? false;
}

export function TranslationsAcademiaSection({
  profileUrl,
  items,
}: {
  profileUrl: string | null;
  items: TranslationIndependentRow[];
}) {
  const academiaItems = items.filter(
    (i) => hasAcademiaTag(i) && i.external_url?.trim()
  );
  if (!profileUrl?.trim() && academiaItems.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="mb-14"
    >
      <h2 className="font-editorial text-xl font-medium text-[var(--foreground)] sm:text-2xl mb-6">
        Akademik Profil
      </h2>
      {profileUrl?.trim() && (
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 flex items-center gap-3 rounded-xl border border-amber-400/20 bg-white/5 px-5 py-4 backdrop-blur-sm transition-all hover:border-amber-400/35 hover:shadow-[0_0_24px_-6px_rgba(212,182,90,0.15)]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-medium text-[var(--foreground)]">Academia.edu</span>
          <ExternalLink className="ml-auto h-4 w-4 text-[var(--muted)]" />
        </a>
      )}
      {academiaItems.length > 0 && (
        <ul className="space-y-3">
          {academiaItems.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <a
                href={item.external_url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-lg border border-amber-400/10 bg-white/5 px-4 py-3 text-sm transition hover:border-amber-400/25 hover:bg-white/10"
              >
                <span className="font-medium text-[var(--foreground)]">
                  {item.title}
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-[var(--muted)]" />
              </a>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}
