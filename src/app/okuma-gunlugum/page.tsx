import Link from "next/link";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { PageHeader } from "@/components/layout/PageHeader";
import Footer from "@/components/Footer";
import { ReadingLogContent } from "@/components/reading/ReadingLogContent";
import {
  getPublicBooks,
  getCurrentReading,
  getReadingGoal,
  getReadingCount,
} from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function OkumaGunlugumPage() {
  const [books, currentReading, goal, readingCount] = await Promise.all([
    getPublicBooks(),
    getCurrentReading(),
    getReadingGoal(),
    getReadingCount(),
  ]);
  /* Rafta soldan sağa: en eskiden en yeniye */
  const booksOldestFirst = [...books].reverse();

  return (
    <PageTransitionTarget layoutId="card-/okuma-gunlugum">
      <main className="relative min-h-screen text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="mb-6 sm:mb-8">
            <Link
              href="/"
              className="text-sm text-white/60 transition-colors hover:text-white/90"
            >
              ← Ana sayfa
            </Link>
          </div>
          <PageHeader
            layoutId="nav-/okuma-gunlugum"
            title="Okuma Günlüğüm"
            titleClassName="!text-white font-bold"
            subtitle="şu an okuduklarım ve yıllık hedefim"
            subtitleClassName="text-white/70"
          />

          <ReadingLogContent
            books={booksOldestFirst}
            currentReading={currentReading}
            readingCount={readingCount}
            goal={goal}
          />
        </div>
        <Footer />
      </main>
    </PageTransitionTarget>
  );
}
