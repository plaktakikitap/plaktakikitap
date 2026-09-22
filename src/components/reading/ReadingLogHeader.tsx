import { getCurrentReading, getReadingGoal } from "@/lib/db/queries";
import { CircularProgress } from "./CircularProgress";
import { BookCoverImage } from "./BookCoverImage";
import { usableBookCoverUrl } from "@/lib/book-cover";

export async function ReadingLogHeader() {
  const [currentReading, goal] = await Promise.all([
    getCurrentReading(),
    getReadingGoal(),
  ]);

  const goalCount = goal?.read_count ?? 0;
  const goalTarget = goal?.goal ?? 12;
  const goalPercent =
    goalTarget > 0 ? Math.min(100, (goalCount / goalTarget) * 100) : 0;

  return (
    <header className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
      {/* Şu An Okuyorum */}
      <div className="rounded-2xl border border-ink/10 bg-ink/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:rounded-3xl sm:p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-ink/60">
          Şu an okuyorum
        </h2>
        {currentReading ? (
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-ink/5 shadow-lg sm:h-40 sm:w-28">
              {usableBookCoverUrl(currentReading.cover_url) ? (
                <BookCoverImage
                  src={currentReading.cover_url}
                  alt={currentReading.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl text-ink/30">
                  📖
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink/95">
                {currentReading.title}
              </p>
              {currentReading.author && (
                <p className="mt-0.5 text-sm text-ink/70">
                  {currentReading.author}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3">
                <CircularProgress
                  percent={currentReading.progress_percent ?? 0}
                  size={72}
                  strokeWidth={6}
                  centerLabel={
                    currentReading.progress_percent != null
                      ? `%${Math.round(currentReading.progress_percent)}`
                      : "—"
                  }
                  fillColor="rgba(251, 191, 36, 0.9)"
                  trackColor="rgba(255,255,255,0.12)"
                />
                <span className="text-sm text-ink/60">
                  İlerleme
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="py-6 text-center text-ink/50">
            Şu an okunan kitap yok. Admin panelinden &quot;Şu an okuyorum&quot; ekleyebilirsiniz.
          </p>
        )}
      </div>

      {/* Yıllık Hedef */}
      <div className="rounded-2xl border border-ink/10 bg-ink/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:rounded-3xl sm:p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-ink/60">
          Yıllık hedef
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap">
          <p className="text-2xl font-semibold tabular-nums text-ink/95 sm:text-3xl">
            {goalCount} <span className="text-ink/60">/</span> {goalTarget}{" "}
            <span className="text-base font-normal text-ink/70 sm:text-lg">
              kitap
            </span>
          </p>
          <CircularProgress
            percent={goalPercent}
            size={100}
            strokeWidth={8}
            centerLabel={`%${Math.round(goalPercent)}`}
            fillColor="rgba(251, 191, 36, 0.9)"
            trackColor="rgba(255,255,255,0.12)"
          />
        </div>
        <p className="mt-2 text-xs text-ink/50">
          {new Date().getFullYear()} yılı hedefi
        </p>
      </div>
    </header>
  );
}
