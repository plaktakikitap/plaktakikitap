"use client";

import { motion } from "framer-motion";
import type { ContentItem, Translation } from "@/types/database";
import { BookOpen, ExternalLink } from "lucide-react";

type TranslationItem = ContentItem & { translation: Translation | Translation[] | null };

function getTranslation(d: TranslationItem): Translation | null {
  const t = d.translation;
  if (!t) return null;
  return Array.isArray(t) ? t[0] ?? null : t;
}

interface TranslationsGridProps {
  translations: TranslationItem[];
}

export function TranslationsGrid({ translations }: TranslationsGridProps) {
  if (translations.length === 0) {
    return (
      <p className="py-12 text-center text-[var(--muted)]">Henüz çeviri yok.</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {translations.map((item, i) => {
        const t = getTranslation(item);
        if (!t) return null;

        const hasExternalUrl = !!t.external_url?.trim();
        const buttonLabel =
          t.link_label === "review" ? "İncele" : "Satın Al";

        return (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            className="group flex overflow-hidden rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-sm transition hover:border-[var(--accent)]/25 hover:shadow-md"
          >
            {/* Cover (left) */}
            <div className="relative w-24 shrink-0 sm:w-28">
              <div className="aspect-[2/3] h-full overflow-hidden bg-gradient-to-b from-[#f5f0e8] to-[#ebe4d9]">
                {t.cover_url ? (
                  <img
                    src={t.cover_url}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center">
                    <BookOpen className="h-8 w-8 text-[var(--muted)]/60 sm:h-10 sm:w-10" />
                    <span className="mt-1 line-clamp-2 text-[10px] font-medium text-[var(--muted)] sm:text-xs">
                      {item.title}
                    </span>
                  </div>
                )}
              </div>
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>

            {/* Title, author, desc (right) */}
            <div className="flex min-w-0 flex-1 flex-col p-4">
              <h3 className="font-editorial font-medium text-[var(--foreground)] line-clamp-2">
                {item.title}
              </h3>
              {t.original_title && (
                <p className="mt-0.5 text-sm italic text-[var(--muted)] line-clamp-1">
                  {t.original_title}
                </p>
              )}
              {t.author && (
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {t.author}
                </p>
              )}
              {item.description && (
                <p className="mt-2 line-clamp-2 text-xs text-[var(--muted)]">
                  {item.description}
                </p>
              )}
              <div className="mt-auto pt-3">
                {hasExternalUrl && (
                  <a
                    href={t.external_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--accent)]/40 bg-[var(--accent-soft)]/50 px-3 py-1.5 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent-soft)] hover:border-[var(--accent)]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {buttonLabel}
                  </a>
                )}
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
