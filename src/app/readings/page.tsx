import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReadingLogContent } from "@/components/reading/ReadingLogContent";
import {
  getPublicBooks,
  getCurrentReading,
  getReadingGoal,
  getReadingCount,
} from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function ReadingsPage() {
  let books: Awaited<ReturnType<typeof getPublicBooks>> = [];
  let currentReading: Awaited<ReturnType<typeof getCurrentReading>> = null;
  let goal: Awaited<ReturnType<typeof getReadingGoal>> = null;
  let readingCount = 0;

  try {
    [books, currentReading, goal, readingCount] = await Promise.all([
      getPublicBooks(),
      getCurrentReading(),
      getReadingGoal(),
      getReadingCount(),
    ]);
  } catch (error) {
    console.error("Reading log data fetch error:", error);
  }

  const booksOldestFirst = [...books].reverse();

  return (
    <PageTransitionTarget layoutId="card-/readings">
      <main className="relative min-h-screen text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          <PageHeader
            layoutId="nav-/readings"
            title="Okuma Günlüğüm"
            titleClassName="!text-white font-bold"
            subtitle="şu an okuduklarım ve yıllık hedefim"
            subtitleClassName="text-white/70"
          />

          <ReadingLogContent
            books={booksOldestFirst}
            currentReading={currentReading}
            readingCount={readingCount}
            totalBookCount={books.length}
            goal={goal}
          />
        </div>
      </main>
    </PageTransitionTarget>
  );
}
