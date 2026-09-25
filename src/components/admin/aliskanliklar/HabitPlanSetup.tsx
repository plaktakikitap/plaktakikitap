"use client";

import { useState } from "react";
import type { Aliskanlik } from "@/types/takip";
import {
  ASAMA_ETIKET,
  HAZIR_PLAN,
  previewHazirPlan,
} from "@/lib/takip/aliskanlik-plan";
import { chipClass, goldBtn } from "./api";

export function HabitPlanSetup({
  habits,
  pending,
  onPreviewApply,
  onActivateStage,
}: {
  habits: Aliskanlik[];
  pending?: boolean;
  onPreviewApply: (maxAsama: number) => void;
  onActivateStage: (asama: number) => void;
}) {
  const [asama, setAsama] = useState(1);
  const { eklenecek, atlanan } = previewHazirPlan(habits, asama);

  return (
    <section className="space-y-4">
      <p className="text-sm text-[#6b6158]">
        Mevcut alışkanlıklar çoğalmaz. Yalnızca eksik olanlar eklenir. Aşamalar
        kilit değildir.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {ASAMA_ETIKET.map((etiket, i) => {
          const n = i + 1;
          return (
            <button
              key={n}
              type="button"
              onClick={() => setAsama(n)}
              className={`rounded-xl border px-3 py-2.5 text-left text-sm ${
                asama === n
                  ? "border-[#b8934a]/50 bg-[#b8934a]/10 text-[#1a1612]"
                  : "border-[#e8e0d4] text-[#6b6158]"
              }`}
            >
              {etiket}
            </button>
          );
        })}
      </div>
      <div className="rounded-2xl border border-[#e8e0d4] bg-white/60 p-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-[#6b6158]">
          Eklenecek ({eklenecek.length})
        </p>
        {eklenecek.length === 0 ? (
          <p className="text-sm text-[#1a1612]/40">Bu aşamada eksik yok.</p>
        ) : (
          <ul className="space-y-1 text-sm text-[#1a1612]">
            {eklenecek.map((s) => (
              <li key={s.plan_kodu}>
                {s.ad}
                <span className="ml-2 text-xs text-[#6b6158]">{s.kategori}</span>
              </li>
            ))}
          </ul>
        )}
        {atlanan.length > 0 ? (
          <p className="mt-3 text-xs text-[#6b6158]">
            Zaten var: {atlanan.map((s) => s.ad).join(", ")}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending || eklenecek.length === 0}
          onClick={() => onPreviewApply(asama)}
          className={goldBtn}
        >
          Eksikleri ekle
        </button>
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            type="button"
            disabled={pending}
            onClick={() => onActivateStage(n)}
            className={chipClass}
          >
            {n}. haftayı etkinleştir
          </button>
        ))}
      </div>
      <p className="text-[11px] text-[#6b6158]">
        Toplam şablon: {HAZIR_PLAN.length} alışkanlık.
      </p>
    </section>
  );
}
