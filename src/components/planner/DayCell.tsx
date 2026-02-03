"use client";

import { cn } from "@/lib/utils";
import type { PlannerDaySummary } from "@/lib/planner";

const TEXT_PREVIEW_LEN = 40;

function isTodayCell(dateStr: string): boolean {
  if (!dateStr) return false;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return dateStr === todayStr;
}

interface DayCellProps {
  day: number | null;
  summary: PlannerDaySummary | null;
  onDayClick: (dateStr: string, monthName: string, day: number) => void;
  dateStr: string;
  monthName: string;
}

export function DayCell({
  day,
  summary,
  onDayClick,
  dateStr,
  monthName,
}: DayCellProps) {
  if (!day) {
    return <div className="min-h-[72px]" />;
  }

  const today = isTodayCell(dateStr);

  const text = summary
    ? (summary.firstEntryTitle || summary.firstEntryContent || "").slice(0, TEXT_PREVIEW_LEN) +
      ((summary.firstEntryTitle || summary.firstEntryContent || "").length > TEXT_PREVIEW_LEN ? "…" : "")
    : "";
  const firstImageUrl = summary?.firstImageUrl ?? null;
  const extraCount = summary ? Math.max(0, summary.entryCount - 1) : 0;

  return (
    <button
      type="button"
      className={cn(
        "dayCell group relative flex min-h-[72px] flex-col rounded-lg border border-black/10 bg-white/40 p-1.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-md",
        today && "today"
      )}
      onClick={() => onDayClick(dateStr, monthName, day)}
      aria-label={`${day} ${monthName} — günlük detayı`}
    >
      <div className="relative z-[1] flex justify-end">
        <span className="text-xs font-semibold text-black/80">{day}</span>
      </div>

      {summary && (
        <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden pt-0.5">
          {text && (
            <div className="flex-1 truncate text-[10px] leading-tight text-black/70">
              {text}
            </div>
          )}
          <div className="relative mt-auto flex min-h-[2.5rem] items-end justify-end">
            {firstImageUrl && (
              <div
                className="absolute bottom-0 right-0 h-10 w-10 overflow-hidden rounded border-2 border-white shadow-md transition-transform duration-200 group-hover:scale-105"
                style={{
                  transform: "rotate(-10deg)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                }}
              >
                <img
                  src={firstImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {extraCount > 0 && (
              <span
                className="absolute bottom-0 right-9 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/95 px-1 text-[9px] font-semibold text-white shadow-sm"
                style={{ transform: "rotate(8deg)" }}
              >
                +{extraCount}
              </span>
            )}
          </div>
        </div>
      )}
    </button>
  );
}
