"use client";

import type { AliskanlikGunModu, AliskanlikGunu } from "@/types/takip";

const MODLAR: { id: AliskanlikGunModu; ad: string; aciklama: string }[] = [
  {
    id: "normal",
    ad: "Normal gün",
    aciklama: "Standart hedefler",
  },
  {
    id: "yogun",
    ad: "Yoğun gün",
    aciklama: "Minimum sürümler yeter",
  },
  {
    id: "toparlanma",
    ad: "Toparlanma",
    aciklama: "Yalnızca kimliği koru",
  },
];

export function DayModeSelector({
  gun,
  disabled,
  onChange,
}: {
  gun: AliskanlikGunu | null;
  disabled?: boolean;
  onChange: (modu: AliskanlikGunModu) => void;
}) {
  const current = gun?.gun_modu ?? "normal";
  return (
    <fieldset className="rounded-2xl border border-[#e8e0d4] bg-white/60 p-4">
      <legend className="px-1 text-xs uppercase tracking-wider text-[#6b6158]">
        Bugünün modu
      </legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {MODLAR.map((m) => {
          const active = current === m.id;
          return (
            <button
              key={m.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(m.id)}
              aria-pressed={active}
              className={`rounded-xl border px-3 py-2.5 text-left transition ${
                active
                  ? "border-[#b8934a]/50 bg-[#b8934a]/10"
                  : "border-[#e8e0d4] hover:bg-[#1a1612]/5"
              }`}
            >
              <span className="block text-sm text-[#1a1612]">{m.ad}</span>
              <span className="mt-0.5 block text-[11px] text-[#6b6158]">
                {m.aciklama}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
