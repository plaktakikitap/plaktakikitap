"use client";

import { DayCell } from "./DayCell";
import type { PlannerDaySummary } from "@/lib/planner";

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function firstWeekday(year: number, monthIndex: number) {
  const js = new Date(year, monthIndex, 1).getDay();
  return (js + 6) % 7;
}

export function monthNameTR(i: number) {
  return [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ][i];
}

interface CalendarGridProps {
  year: number;
  monthIndex: number;
  summaryByDate: Record<string, PlannerDaySummary>;
  onDayClick: (dateStr: string, monthName: string, day: number) => void;
}

export function CalendarGrid({
  year,
  monthIndex,
  summaryByDate,
  onDayClick,
}: CalendarGridProps) {
  const totalDays = daysInMonth(year, monthIndex);
  const start = firstWeekday(year, monthIndex);

  const cells = Array.from({ length: 42 }, (_, idx) => {
    const dayNum = idx - start + 1;
    return dayNum >= 1 && dayNum <= totalDays ? dayNum : null;
  });

  const monthName = monthNameTR(monthIndex);

  return (
    <>
      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-semibold">{monthName}</h3>
        <div className="text-xs opacity-60">{year}</div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5 text-xs">
        {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
          <div key={d} className="opacity-60">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid flex-1 grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          const dateStr = d
            ? `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
            : "";
          const summary = dateStr ? summaryByDate[dateStr] ?? null : null;

          return (
            <DayCell
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
