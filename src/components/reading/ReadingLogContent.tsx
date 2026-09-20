"use client";

import { useState } from "react";
import Link from "next/link";
import type { Book } from "@/types/database";
import { ReadingLogHeaderCards } from "./ReadingLogHeaderCards";
import { ReadingLogBooksSection } from "./ReadingLogBooksSection";

interface ReadingGoal {
  year: number;
  goal: number;
  read_count: number;
}

export type StatusFilterValue = "" | "reading" | "finished" | "paused" | "dropped";

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

  const goalCount = goal?.read_count ?? 0;
  const goalTarget = goal?.goal ?? 12;

  return (
    <>
      <div className="mt-6 flex justify-end">
        <Link
          href="/okuma-gunlugum/istatistikler"
          className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(201,166,90,0.25)] bg-[rgba(201,166,90,0.08)] px-3.5 py-1.5 text-xs tracking-wide text-[#c9a65a] transition-colors hover:border-[rgba(201,166,90,0.45)] hover:bg-[rgba(201,166,90,0.14)] hover:text-[#f3ead9]"
        >
          <span aria-hidden>📊</span>
          istatistiklerimi gör
        </Link>
      </div>

      <section className="mt-6">
        <ReadingLogHeaderCards
          currentReading={currentReading}
          readingCount={readingCount}
          goalCount={goalCount}
          goalTarget={goalTarget}
          onFilterReading={() => setStatusFilter("reading")}
        />
      </section>

      <aside className="mt-10 rounded-xl border border-[rgba(201,166,90,0.15)] bg-white/[0.03] px-4 py-5 sm:px-6 sm:py-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-[#c9a65a]/80">
          Not
        </p>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/65">
          <p>
            Tüm okuduğum kitapları giremedim, girdiklerimin de kapak fotoğraflarını girmeye üşendim.
            Bir çoğunun yorumu da yok zaten… Onun için biraz garip bir sayfa.
          </p>
          <p>
            Bu siteyi kurduktan itibaren düzene oturacak bu iş de :) Düzen ve kendini takip iyidir.
            Kitap yorumu yazmak iyidir. Gelecekte dönüp bakmak iyidir. Kalıcı yapar.
          </p>
          <p className="font-display italic text-[#f3ead9]/80">Herkese iyi okumalar!</p>
        </div>
      </aside>

      <section className="mt-12">
        <h2 className="mb-4 font-editorial text-xl font-medium text-white/90">
          Kitaplık{totalBookCount != null ? ` (${totalBookCount})` : ""}
        </h2>
        <p className="mb-4 text-sm text-white/60">
          Kitaplar sırt görünümüyle; genişlik sayfa sayısına göre değişir. Bir kitaba tıklayın.
        </p>
        <ReadingLogBooksSection
          books={books}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </section>
    </>
  );
}
