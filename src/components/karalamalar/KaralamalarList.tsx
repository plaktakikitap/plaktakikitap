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

function preview(text: string, max = 140): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trimEnd()}...`;
}

export function KaralamalarList({ items }: { items: Karalama[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = items.slice(0, visible);
  const hasMore = visible < items.length;

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-[#9a9488]">
        Henüz {SECTION_NAME} yok.
      </p>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-[rgba(201,166,90,0.15)]">
        {shown.map((k) => (
          <li key={k.id}>
            <Link
              href={`${SECTION_PATH}/${k.slug}`}
              className="group flex flex-col gap-2 py-6 no-underline sm:flex-row sm:items-start sm:justify-between sm:gap-8"
            >
              <div className="min-w-0 flex-1">
                <h2
                  className="text-2xl font-medium leading-snug text-[#f3ead9] transition-colors group-hover:text-[#c9a65a] sm:text-3xl"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {k.baslik}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#9a9488]">
                  {preview(k.icerik)}
                </p>
              </div>
              <time
                dateTime={k.olusturma_tarihi}
                className="shrink-0 pt-1 text-xs tracking-wide text-[#9a9488]/70"
              >
                {formatDate(k.olusturma_tarihi)}
              </time>
            </Link>
          </li>
        ))}
      </ul>

      {hasMore ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="rounded-full border border-[rgba(201,166,90,0.35)] px-5 py-2 text-xs uppercase tracking-[0.18em] text-[#c9a65a] transition hover:bg-[rgba(201,166,90,0.1)]"
          >
            Daha fazla yükle
          </button>
        </div>
      ) : null}
    </div>
  );
}
