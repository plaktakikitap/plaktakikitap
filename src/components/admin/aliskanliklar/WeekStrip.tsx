"use client";

import type { Aliskanlik, AliskanlikKayit } from "@/types/takip";
import { isAliskanlikKayitDone } from "@/lib/takip/aliskanlik-done";
import { addDaysISO } from "@/lib/date/istanbul";

export function WeekStrip({
  habit,
  logs,
  today,
}: {
  habit: Aliskanlik;
  logs: AliskanlikKayit[];
  today: string;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(today, i - 6));
  return (
    <div className="flex gap-1" aria-label="Son 7 gün">
      {days.map((iso) => {
        const kayit = logs.find(
          (l) => l.aliskanlik_id === habit.id && l.tarih === iso
        );
        const done = kayit ? isAliskanlikKayitDone(kayit) : false;
        const skip = kayit?.durum === "planli_degil";
        return (
          <span
            key={iso}
            title={iso}
            className={`h-2 w-2 rounded-full ${
              skip
                ? "bg-[#1a1612]/15"
                : done
                  ? "bg-[#b8934a]"
                  : "bg-[#1a1612]/10"
            }`}
          />
        );
      })}
    </div>
  );
}
