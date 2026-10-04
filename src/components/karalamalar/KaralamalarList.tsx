"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SECTION_NAME, SECTION_PATH } from "@/lib/karalamalar-section";
import type { Karalama } from "@/lib/karalamalar";
import { hasSpoilerMarkup } from "@/lib/spoiler";
import { formatDateTr } from "@/lib/format-date-tr";

const PAGE_SIZE = 12;
const PREVIEW_MAX = 220;

function previewOf(content: string): string {
  const clean = content
    .replace(/\[spoiler\][\s\S]*?\[\/spoiler\]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return hasSpoilerMarkup(content) ? "Spoiler içerir" : "";
  if (clean.length <= PREVIEW_MAX) return clean;
  const cut = clean.slice(0, PREVIEW_MAX);
  const lastSpace = cut.lastIndexOf(" ");
  const base = (lastSpace > PREVIEW_MAX * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd();
  return `${base}…`;
}

export function KaralamalarList({ items }: { items: Karalama[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = items.slice(0, visible);
  const hasMore = visible < items.length;

  const groups = useMemo(() => {
    const next: { key: string; label: string; items: Karalama[] }[] = [];
    for (const item of shown) {
      const date = formatDateTr(item.olusturma_tarihi);
      const last = next[next.length - 1];
      if (last && last.key === date.key) {
        last.items.push(item);
      } else {
        next.push({
          key: date.key,
          label: date.label,
          items: [item],
        });
      }
    }
    return next;
  }, [shown]);

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-ink-muted">
        Henüz {SECTION_NAME} yok.
      </p>
    );
  }

  let cardIndex = 0;

  return (
    <div>
      <div className="space-y-12">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="mb-4 flex items-center gap-3 font-editorial text-[1.2rem] font-medium tracking-[-0.01em] text-ink">
              <span aria-hidden className="h-px w-8 bg-gold" />
              {group.label}
            </h2>
            <div className="relative space-y-4 pl-6 sm:pl-8">
              <span
                aria-hidden
                className="absolute bottom-3 left-[5px] top-3 w-px bg-gold/35 sm:left-[6px]"
              />
              {group.items.map((item) => {
                const delay = Math.min(cardIndex, 8) * 45;
                cardIndex += 1;
                const preview = previewOf(item.icerik);
                return (
                  <article
                    key={item.id}
                    className="karalama-card relative"
                    style={{ animationDelay: `${delay}ms` }}
                  >
                    <span
                      aria-hidden
                      className="absolute -left-6 top-6 h-3 w-3 rounded-full border-2 border-gold bg-cream sm:-left-8 sm:top-7"
                    />
                    <Link
                      href={`${SECTION_PATH}/${item.slug}`}
                      className="group block rounded-2xl border border-[#1a1612]/[0.08] bg-white/55 px-5 py-5 no-underline shadow-[0_12px_32px_rgba(26,22,18,0.05)] transition duration-300 hover:-translate-y-1 hover:border-gold/45 hover:shadow-[0_18px_40px_rgba(26,22,18,0.09)] sm:px-6 sm:py-6"
                    >
                      <h3 className="type-3 m-0 font-editorial font-medium tracking-[-0.01em] text-ink">
                        {item.baslik}
                      </h3>
                      {preview ? (
                        <p className="m-0 mt-3 line-clamp-4 text-[1rem] leading-[1.75] text-ink/75">
                          {preview}
                        </p>
                      ) : null}
                      <span className="mt-4 inline-flex items-center gap-2 type-4 tracking-[0.08em] text-ink-muted transition group-hover:text-gold">
                        oku
                        <span
                          aria-hidden
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#1a1612]/15 text-[0.95rem] leading-none text-ink transition group-hover:border-gold group-hover:text-gold"
                        >
                          →
                        </span>
                      </span>
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {hasMore ? (
        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={() => setVisible((count) => count + PAGE_SIZE)}
            className="group inline-flex items-center gap-3 text-ink-muted transition hover:text-ink"
          >
            <span className="type-4 tracking-[0.04em]">daha fazla</span>
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#1a1612]/15 text-[1.05rem] leading-none text-ink transition group-hover:border-gold group-hover:text-gold"
            >
              ↓
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
