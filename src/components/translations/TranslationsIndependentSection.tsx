"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { TranslationIndependentRow } from "@/types/database";
import { ExternalLink, FileText } from "lucide-react";

export function TranslationsIndependentSection({
  items,
}: {
  items: TranslationIndependentRow[];
}) {
  if (items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mb-14"
    >
      <h2 className="font-editorial text-xl font-medium text-[var(--foreground)] sm:text-2xl mb-2">
        Kendi Kendime Çevirilerim
      </h2>
      <p className="text-sm text-[var(--muted)] mb-6">
        Bağımsız ve kişisel çeviri projeleri.
      </p>
      <div className="space-y-4">
        {items.map((item, i) => (
          <IndependentCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </motion.section>
  );
}

function IndependentCard({
  item,
  index,
}: {
  item: TranslationIndependentRow;
  index: number;
}) {
  const [showTags, setShowTags] = useState(false);
  const hasTags = item.tags && item.tags.length > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className="group rounded-xl border border-amber-400/15 bg-white/5 backdrop-blur-sm p-4 sm:p-5 transition-all duration-200 hover:border-amber-400/25 hover:shadow-[0_0_24px_-6px_rgba(212,182,90,0.15)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-editorial font-medium text-[var(--foreground)]">
            {item.title}
          </h3>
          {item.year != null && (
            <p className="mt-0.5 text-sm text-[var(--muted)]">{item.year}</p>
          )}
          {item.description?.trim() && (
            <p className="mt-2 text-sm text-[var(--muted)] line-clamp-2">
              {item.description}
            </p>
          )}
          {hasTags && (
            <div className="mt-2">
              {showTags ? (
                <div className="flex flex-wrap gap-1.5">
                  {item.tags!.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300"
                    >
                      {t}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowTags(false)}
                    className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    Gizle
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTags(true)}
                  className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Etiketler
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          {item.external_url && (
            <a
              href={item.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-800 dark:text-amber-200 hover:bg-amber-500/20 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Oku
            </a>
          )}
          {item.file_url && (
            <a
              href={item.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-white/5 px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-white/10 transition"
            >
              <FileText className="h-3.5 w-3.5" />
              PDF
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
