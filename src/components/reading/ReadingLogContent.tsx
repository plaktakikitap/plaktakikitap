"use client";

import { useState } from "react";
import Link from "next/link";
import type { Book } from "@/types/database";
import { ReadingLogHeaderCards } from "./ReadingLogHeaderCards";
import { ReadingLogBooksSection } from "./ReadingLogBooksSection";
import { ReadingLogQuotesSection } from "./ReadingLogQuotesSection";

interface ReadingGoal {
  year: number;
  goal: number;
  read_count: number;
}

export type StatusFilterValue = "" | "reading" | "finished" | "paused" | "dropped";

type MainTab = "kitaplik" | "alintilar";

interface ReadingLogContentProps {
  books: Book[];
  currentReading: Book | null;
  readingCount: number;
  totalBookCount?: number;
  goal: ReadingGoal | null;
}

export function ReadingLogContent({
  books,
  currentReading,
  readingCount,
  totalBookCount,
  goal,
}: ReadingLogContentProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("");
  const [tab, setTab] = useState<MainTab>("kitaplik");

  const goalCount = goal?.read_count ?? 0;
  const goalTarget = goal?.goal ?? 12;

  return (
    <>
      <div className="mt-6 flex justify-end">
        <Link
          href="/okuma-gunlugum/istatistikler"
          className="inline-flex items-center rounded-full border border-gold/30 bg-gold-soft px-3.5 py-1.5 text-xs tracking-wide text-gold transition-colors hover:border-rule hover:bg-gold-soft hover:text-ink"
        >
          istatistiklerimi gör
        </Link>
      </div>

      <section className="mt-6">
        <ReadingLogHeaderCards
          currentReading={currentReading}
          readingCount={readingCount}
          goalCount={goalCount}
          goalTarget={goalTarget}
          onFilterReading={() => {
            setTab("kitaplik");
            setStatusFilter("reading");
          }}
        />
      </section>

      <section className="mt-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div
            className="inline-flex rounded-full border border-rule bg-card p-0.5 text-sm"
            role="tablist"
            aria-label="Okuma günlüğü bölümleri"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "kitaplik"}
              onClick={() => setTab("kitaplik")}
              className={`rounded-full px-4 py-2 transition ${
                tab === "kitaplik"
                  ? "bg-ink text-cream"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Kitaplık
              {totalBookCount != null ? (
                <span className="ml-1.5 opacity-70">({totalBookCount})</span>
              ) : null}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "alintilar"}
              onClick={() => setTab("alintilar")}
              className={`rounded-full px-4 py-2 transition ${
                tab === "alintilar"
                  ? "bg-ink text-cream"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Alıntılar
            </button>
          </div>
        </div>

        {tab === "kitaplik" ? (
          <>
            <p className="mb-4 text-sm text-ink/60">
              Kitaplar sırt görünümüyle; genişlik sayfa sayısına göre değişir. Bir kitaba tıklayın.
            </p>
            <ReadingLogBooksSection
              books={books}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </>
        ) : (
          <ReadingLogQuotesSection />
        )}
      </section>
    </>
  );
}
