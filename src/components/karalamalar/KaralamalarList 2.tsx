"use client";

import { useState } from "react";
import Link from "next/link";
import { SECTION_NAME, SECTION_PATH } from "@/lib/karalamalar-section";
import type { Karalama } from "@/lib/karalamalar";

const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function KaralamalarList({ items }: { items: Karalama[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = items.slice(0, visible);
  const hasMore = visible < items.length;

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-ink-muted">
        Henüz {SECTION_NAME} yok.
      </p>
    );
  }

  return (
    <div>
      {shown.map((k, idx) => (
        <div key={k.id}>
          <article className="mb-12">
            <h2
              className="m-0 mb-3 text-[1.15rem] font-semibold tracking-[-0.01em] text-ink"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              <Link
                href={`${SECTION_PATH}/${k.slug}`}
                className="text-inherit no-underline"
              >
                {k.baslik}
              </Link>
            </h2>
            <div className="max-w-[680px] whitespace-pre-wrap text-[0.95rem] leading-[1.75] text-ink-muted">
              {k.icerik}
            </div>
            <time
              dateTime={k.olusturma_tarihi}
              className="mt-3 block text-[0.78rem] tracking-[0.03em] text-ink-muted"
            >
              {formatDate(k.olusturma_tarihi)}
            </time>
          </article>
          {idx < shown.length - 1 || hasMore ? (
            <hr className="mb-12 border-0 border-t border-[rgba(184,147,74,0.1)]" />
          ) : null}
        </div>
      ))}

      {hasMore ? (
        <div className="flex justify-center pb-8">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="text-[0.78rem] tracking-[0.12em] text-ink-muted transition hover:text-gold"
          >
            daha fazla
          </button>
        </div>
      ) : null}
    </div>
  );
}
