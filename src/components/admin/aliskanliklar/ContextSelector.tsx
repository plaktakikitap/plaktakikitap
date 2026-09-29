"use client";

import type { AliskanlikBaglam } from "@/types/takip";
import { BAGLAM_SECENEK } from "@/lib/takip/aliskanlik-now";

export function ContextSelector({
  value,
  disabled,
  onChange,
}: {
  value: AliskanlikBaglam | null;
  disabled?: boolean;
  onChange: (baglam: AliskanlikBaglam | null) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wider text-[#6b6158]">
        Şu an
      </p>
      <div className="flex flex-wrap gap-1.5">
        {BAGLAM_SECENEK.map((b) => {
          const on = value === b.id;
          return (
            <button
              key={b.id}
              type="button"
              disabled={disabled}
              aria-pressed={on}
              onClick={() => onChange(on ? null : b.id)}
              className={`rounded-lg px-3 py-1.5 text-xs ${
                on
                  ? "bg-[#b8934a]/20 text-[#1a1612]"
                  : "border border-[#e8e0d4] text-[#6b6158] hover:bg-[#1a1612]/5"
              } disabled:opacity-40`}
            >
              {b.ad}
            </button>
          );
        })}
      </div>
    </div>
  );
}
