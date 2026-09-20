"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import type { QuoteWithBook } from "@/lib/quotes";

const fetcher = async (url: string): Promise<QuoteWithBook[]> => {
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

function shuffle<T>(list: T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

type SortMode = "date" | "random";

export function ReadingLogQuotesSection() {
  const { data, isLoading } = useSWR<QuoteWithBook[]>("/api/quotes", fetcher, {
    revalidateOnFocus: false,
  });
  const [mode, setMode] = useState<SortMode>("date");
  const [randomSeed, setRandomSeed] = useState(0);

  const quotes = useMemo(() => {
    const list = data ?? [];
    if (mode === "date") {
      return [...list].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    // randomSeed değişince yeniden karıştır
    void randomSeed;
    return shuffle(list);
  }, [data, mode, randomSeed]);

  const setRandom = useCallback(() => {
    setMode("random");
    setRandomSeed((s) => s + 1);
  }, []);

  useEffect(() => {
    if (mode === "random" && randomSeed === 0 && (data?.length ?? 0) > 0) {
      setRandomSeed(1);
    }
  }, [mode, randomSeed, data?.length]);

  return (
    <section className="mt-2">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {isLoading
            ? "Yükleniyor…"
            : `${quotes.length} alıntı`}
        </p>
        <div className="inline-flex rounded-full border border-rule bg-card p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode("date")}
            className={`rounded-full px-3 py-1.5 transition ${
              mode === "date"
                ? "bg-ink text-cream"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Tarihe göre
          </button>
          <button
            type="button"
            onClick={setRandom}
            className={`rounded-full px-3 py-1.5 transition ${
              mode === "random"
                ? "bg-ink text-cream"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Rastgele
          </button>
        </div>
      </div>

      {!isLoading && quotes.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-muted">
          Henüz alıntı yok.
        </p>
      ) : (
        <ul className="space-y-6">
          {quotes.map((q) => (
            <li
              key={q.id}
              className="rounded-xl border border-rule bg-card px-5 py-5 sm:px-6"
            >
              <span className="inline-block rounded-full border border-rule bg-cream px-2.5 py-0.5 text-[0.68rem] font-medium tracking-wide text-ink-muted">
                {q.book_title}
                {q.book_author ? (
                  <span className="text-ink-muted/70"> · {q.book_author}</span>
                ) : null}
              </span>
              <p className="mt-3 font-display text-3xl leading-none text-gold/60" aria-hidden>
                “
              </p>
              <p className="-mt-1 font-editorial text-[1.1rem] leading-relaxed text-ink">
                {q.text}
              </p>
              {q.page_number != null ? (
                <p className="mt-2 text-xs text-ink-muted">s. {q.page_number}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
