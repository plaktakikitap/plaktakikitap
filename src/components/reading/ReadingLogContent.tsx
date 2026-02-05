"use client";

import { useState } from "react";
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
  goal: ReadingGoal | null;
}

export function ReadingLogContent({
  books,
  currentReading,
  readingCount,
  goal,
}: ReadingLogContentProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("");

  const goalCount = goal?.read_count ?? 0;
  const goalTarget = goal?.goal ?? 12;

  return (
    <>
      <section className="mt-8">
        <ReadingLogHeaderCards
          currentReading={currentReading}
          readingCount={readingCount}
          goalCount={goalCount}
          goalTarget={goalTarget}
          onFilterReading={() => setStatusFilter("reading")}
        />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 font-editorial text-xl font-medium text-white/90">
          Kitaplık
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
