"use client";

import { cn } from "@/lib/utils";
import type { PlannerDaySummary } from "@/lib/planner";

function isTodayCell(dateStr: string): boolean {
  if (!dateStr) return false;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return dateStr === todayStr;
}

const POLAROID_ROTATIONS = [-45, 45, -35, 35, -25];

interface MessyDayCellProps {
  day: number | null;
  summary: PlannerDaySummary | null;
  onDayClick: (dateStr: string, monthName: string, day: number) => void;
  dateStr: string;
  monthName: string;
}

/** El çizimi daire, polaroid önizlemeler, özet cümle, yoğun gün doodle */
export function MessyDayCell({
  day,
  summary,
  onDayClick,
  dateStr,
  monthName,
}: MessyDayCellProps) {
  if (!day) {
    return <div className="min-h-[56px]" />;
  }

  const hasEntry = !!summary && summary.entryCount > 0;
  const today = isTodayCell(dateStr);
  const isBusy = !!summary?.isBusy;
  const imageUrls = summary?.imageUrls ?? [];
  const summaryQuote = summary?.summaryQuote;

  return (
    <button
      type="button"
      className={cn(
        "messy-day-cell relative flex min-h-[56px] flex-col rounded-md border border-black/8 bg-white/30 p-1 text-left transition hover:bg-white/60",
        today && "today",
        hasEntry && "ring-1 ring-amber-900/20",
        isBusy && "ring-1 ring-amber-600/30"
      )}
      onClick={() => onDayClick(dateStr, monthName, day)}
      aria-label={`${day} ${monthName}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="relative z-[2] flex justify-end">
        <span
          className="text-xs font-semibold text-black/75"
          style={{ fontFamily: "var(--font-handwriting), cursive" }}
        >
          {day}
        </span>
      </div>

      {/* El çizimi daire — giriş varsa */}
      {hasEntry && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 0 }}
        >
          <svg
            viewBox="0 0 40 40"
            className="h-[70%] w-[70%] opacity-25"
            style={{ transform: "rotate(-2deg)" }}
          >
            <ellipse
              cx="20"
              cy="20"
              rx="16"
              ry="17"
              fill="none"
              stroke="rgba(120,80,50,0.5)"
              strokeWidth="1.5"
              strokeDasharray="2 1"
            />
          </svg>
        </div>
      )}

      {/* Yoğun gün — daire içine alma doodle */}
      {isBusy && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 0 }}
        >
          <svg
            viewBox="0 0 40 40"
            className="h-[85%] w-[85%] opacity-30"
            style={{ transform: `rotate(${day % 2 === 0 ? 3 : -4}deg)` }}
          >
            <path
              d="M8 20 Q8 8 20 8 Q32 8 32 20 Q32 32 20 32 Q8 32 8 20"
              fill="none"
              stroke="rgba(180,120,60,0.4)"
              strokeWidth="1.2"
              strokeDasharray="3 2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Minik polaroidler — rastgele ±45 derece, üst üste bindirilmiş */}
      {imageUrls.length > 0 && (
        <div
          className="absolute bottom-0 right-0 flex items-end justify-end"
          style={{ zIndex: 1, width: "85%", height: "75%" }}
        >
          {imageUrls.slice(0, 3).map((url, i) => {
            const rot = POLAROID_ROTATIONS[i] ?? (i % 2 === 0 ? -45 : 45);
            return (
              <div
                key={i}
                className="absolute overflow-hidden rounded-sm border border-black/12 bg-white shadow-sm"
                style={{
                  width: 24 - i * 2,
                  height: 20 - i * 1.5,
                  right: i * 5,
                  bottom: i * 3,
                  transform: `rotate(${rot}deg)`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
            );
          })}
        </div>
      )}

      {/* Özet cümle — kurşun kalemle sonradan eklenmiş, silik, el yazısı */}
      {summaryQuote && (
        <p
          className="absolute bottom-0 left-0.5 right-0.5 line-clamp-2 text-[7px] leading-tight"
          style={{
            fontFamily: "var(--font-handwriting), cursive",
            zIndex: 2,
            color: "rgba(80,70,60,0.55)",
            textShadow: "0 0 1px rgba(120,100,80,0.2)",
            fontStyle: "italic",
          }}
        >
          {summaryQuote}
        </p>
      )}
    </button>
  );
}
