"use client";

import type { Aliskanlik, AliskanlikKayit } from "@/types/takip";
import { altDoneCount, nextOpenStep } from "@/lib/takip/aliskanlik-progress";

export function SubstepToggles({
  habit,
  kayit,
  pending,
  sequential,
  onToggle,
}: {
  habit: Aliskanlik;
  kayit: AliskanlikKayit | undefined;
  pending?: boolean;
  sequential?: boolean;
  onToggle: (kod: string, next: boolean) => void;
}) {
  const map = kayit?.alt_adimlar ?? {};
  const firstOpen = sequential
    ? habit.alt_adimlar.findIndex((s) => !map[s.kod])
    : -1;
  return (
    <ul className="space-y-1.5">
      {habit.alt_adimlar.map((s, idx) => {
        const done = Boolean(map[s.kod]);
        const disable = Boolean(
          pending || (sequential && firstOpen >= 0 && idx > firstOpen && !done)
        );
        return (
          <li key={s.kod}>
            <label
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                disable ? "opacity-40" : "hover:bg-[#1a1612]/5"
              }`}
            >
              <input
                type="checkbox"
                checked={done}
                disabled={disable}
                onChange={(e) => onToggle(s.kod, e.target.checked)}
                className="h-4 w-4 accent-amber-500"
              />
              <span className={done ? "text-[#1a1612]/50" : "text-[#1a1612]"}>
                {s.ad}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export function SubstepSummary({
  habit,
  kayit,
  grup,
}: {
  habit: Aliskanlik;
  kayit: AliskanlikKayit | undefined;
  grup?: string;
}) {
  const { done, total } = altDoneCount(habit, kayit, grup);
  const next = nextOpenStep(habit, kayit);
  return (
    <p className="text-sm text-[#1a1612]">
      {done}/{total}
      {next ? (
        <span className="ml-2 text-xs text-[#6b6158]">Sıradaki: {next}</span>
      ) : null}
    </p>
  );
}
