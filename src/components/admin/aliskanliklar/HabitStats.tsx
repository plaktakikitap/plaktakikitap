"use client";

import type { Aliskanlik, AliskanlikKayit } from "@/types/takip";
import { calcStreak } from "@/lib/takip/aliskanlik-streak";
import {
  durumCounts,
  kategoriDengesi,
  lastDoneISO,
  lastNRate,
  last90Heatmap,
} from "@/lib/takip/aliskanlik-stats";

function heatColor(ratio: number, planned: number) {
  if (planned === 0) return "bg-[#1a1612]/6";
  if (ratio === 0) return "bg-[#1a1612]/10";
  if (ratio < 0.4) return "bg-[#b8934a]/30";
  if (ratio < 0.8) return "bg-[#b8934a]/60";
  return "bg-[#b8934a]";
}

export function HabitStats({
  habits,
  logs,
  today,
}: {
  habits: Aliskanlik[];
  logs: AliskanlikKayit[];
  today: string;
}) {
  const aktif = habits.filter((h) => h.aktif && !h.arsivlendi);
  const heat = last90Heatmap(aktif, logs, today);
  const denge = kategoriDengesi(aktif, logs, today);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#e8e0d4] bg-white/60 p-5">
        <h3 className="mb-3 text-sm text-[#6b6158]">
          Son 90 gün — planlananların tamamlanma oranı
        </h3>
        <div className="flex flex-wrap gap-1">
          {heat.map((d) => (
            <div
              key={d.iso}
              title={`${d.iso}: ${d.done}/${d.planned}`}
              className={`h-3 w-3 rounded-sm ${heatColor(d.ratio, d.planned)}`}
            />
          ))}
        </div>
      </section>

      {denge.length > 0 ? (
        <section className="rounded-2xl border border-[#e8e0d4] bg-white/60 p-5">
          <h3 className="mb-3 text-sm text-[#6b6158]">Haftalık kategori dengesi</h3>
          <ul className="space-y-2">
            {denge.map((k) => (
              <li key={k.kategori} className="flex justify-between text-sm">
                <span className="text-[#1a1612]">{k.kategori}</span>
                <span className="text-[#6b6158]">
                  {k.tamamlanan}/{k.planlanan}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ul className="space-y-3">
        {aktif.map((h) => {
          const r7 = lastNRate(h, logs, 7, today);
          const r30 = lastNRate(h, logs, 30, today);
          const counts = durumCounts(h, logs);
          const last = lastDoneISO(h, logs);
          const streak = calcStreak(logs, h, today);
          return (
            <li
              key={h.id}
              className="rounded-2xl border border-[#e8e0d4] bg-white/60 p-4"
            >
              <p className="text-sm text-[#1a1612]">{h.ad}</p>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#6b6158] sm:grid-cols-4">
                <div>
                  7 gün {r7.tamamlanan}/{r7.planlanan}
                </div>
                <div>
                  30 gün {r30.tamamlanan}/{r30.planlanan}
                </div>
                <div>min {counts.minimum}</div>
                <div>hedef {counts.hedef}</div>
                <div>bonus {counts.bonus}</div>
                <div>toparlanma {counts.toparlanma}</div>
                <div>zincir {streak}</div>
                <div>son {last ?? "—"}</div>
              </dl>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
