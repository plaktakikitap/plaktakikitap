"use client";

import { MessyDayCell } from "./MessyDayCell";
import type { PlannerDaySummary } from "@/lib/planner";
import { monthNameTR } from "./CalendarGrid";

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function firstWeekday(year: number, monthIndex: number) {
  const js = new Date(year, monthIndex, 1).getDay();
  return (js + 6) % 7;
}

interface MessyCalendarGridProps {
  year: number;
  monthIndex: number;
  summaryByDate: Record<string, PlannerDaySummary>;
  onDayClick: (dateStr: string, monthName: string, day: number) => void;
}

export function MessyCalendarGrid({
  year,
  monthIndex,
  summaryByDate,
  onDayClick,
}: MessyCalendarGridProps) {
  const totalDays = daysInMonth(year, monthIndex);
  const start = firstWeekday(year, monthIndex);

  const cells = Array.from({ length: 42 }, (_, idx) => {
    const dayNum = idx - start + 1;
    return dayNum >= 1 && dayNum <= totalDays ? dayNum : null;
  });

  const monthName = monthNameTR(monthIndex);

  return (
    <>
      <div className="flex items-baseline justify-between -skew-x-1 font-display">
        <h3 className="text-2xl font-semibold text-black/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.04)]">{monthName}</h3>
        <span className="text-sm opacity-60 skew-x-1 font-sans">{year}</span>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 text-xs opacity-70 font-sans">
        {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d, i) => (
          <div key={d} className={`py-0.5 text-center font-medium ${i % 3 === 0 ? "-skew-x-0.5" : i % 3 === 1 ? "skew-x-0.5" : ""}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1.5 grid flex-1 grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          const dateStr = d
            ? `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
            : "";
          const summary = dateStr ? summaryByDate[dateStr] ?? null : null;

          return (
            <MessyDayCell
              key={i}
              day={d}
              summary={summary}
              dateStr={dateStr}
              monthName={monthName}
              onDayClick={onDayClick}
            />
          );
        })}
      </div>
    </>
  );
}
