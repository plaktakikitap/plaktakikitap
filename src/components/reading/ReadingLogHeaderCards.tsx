"use client";

import Image from "next/image";
import type { Book } from "@/types/database";
import { CircularProgress } from "./CircularProgress";

interface ReadingLogHeaderCardsProps {
  currentReading: Book | null;
  readingCount: number;
  goalCount: number;
  goalTarget: number;
  onFilterReading: () => void;
}

export function ReadingLogHeaderCards({
  currentReading,
  readingCount,
  goalCount,
  goalTarget,
  onFilterReading,
}: ReadingLogHeaderCardsProps) {
  const goalPercent =
    goalTarget > 0 ? Math.min(100, Math.round((goalCount / goalTarget) * 100)) : 0;
  const progressPercent = currentReading?.progress_percent ?? 0;

  const canFilterReading = (currentReading ?? readingCount > 0);

  return (
    <header className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
      {/* Sol: Şu an okuyorum */}
      <div
        role={canFilterReading ? "button" : undefined}
        tabIndex={canFilterReading ? 0 : undefined}
        onClick={canFilterReading ? onFilterReading : undefined}
        onKeyDown={
          canFilterReading
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onFilterReading();
                }
              }
            : undefined
        }
        className={`group relative rounded-2xl border border-white/10 bg-white/5 p-5 text-left shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:rounded-3xl sm:p-6 ${
          canFilterReading
            ? "cursor-pointer transition hover:border-white/20 hover:bg-white/[0.07]"
            : ""
        }`}
      >
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-white/60">
          Şu an okuyorum
        </h2>
        {currentReading ? (
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <div className="relative h-32 w-24 overflow-hidden rounded-xl border border-white/10 bg-white/10 shadow-lg sm:h-40 sm:w-28">
                {currentReading.cover_url ? (
                  <Image
                    src={currentReading.cover_url}
                    alt={currentReading.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 96px, 112px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl text-white/30">
                    📖
                  </div>
                )}
              </div>
              {readingCount > 1 && (
                <span
                  className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--background)] bg-amber-500/90 text-xs font-bold text-white shadow-lg"
                  title={`${readingCount} kitap okunuyor`}
                >
                  +{readingCount - 1}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white/95 group-hover:text-white">
                {currentReading.title}
              </p>
              {currentReading.author && (
                <p className="mt-0.5 text-sm text-white/70">
                  {currentReading.author}
                </p>
              )}
              <div className="mt-3">
                <div className="flex items-center justify-between gap-2 text-xs text-white/60">
                  <span>İlerleme</span>
                  <span className="tabular-nums text-white/80">
                    %{Math.round(progressPercent)}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/15"
                  role="progressbar"
                  aria-valuenow={Math.round(progressPercent)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-amber-400/90 transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="py-6 text-center text-white/50">
            Şu an okunan kitap yok. Admin panelinden ekleyebilirsiniz.
          </p>
        )}
      </div>

      {/* Sağ: Yıllık hedef */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:rounded-3xl sm:p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-white/60">
          Yıllık hedef
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap">
          <p className="text-2xl font-semibold tabular-nums text-white/95 sm:text-3xl">
            {goalCount} <span className="text-white/60">/</span> {goalTarget}{" "}
            <span className="text-base font-normal text-white/70 sm:text-lg">
              kitap
            </span>
          </p>
          <CircularProgress
            percent={goalPercent}
            size={100}
            strokeWidth={8}
            centerLabel={`%${goalPercent}`}
            centerLabelClassName="text-white"
            fillColor="rgba(251, 191, 36, 0.9)"
            trackColor="rgba(255,255,255,0.12)"
          />
        </div>
        <p className="mt-2 text-xs text-white/50">
          Hedefin %{goalPercent}&apos;i tamamlandı
        </p>
      </div>
    </header>
  );
}
