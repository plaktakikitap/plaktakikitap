"use client";

import { useMemo, useState } from "react";
import type { Aliskanlik, AliskanlikAksamKayit, AliskanlikAltAdim } from "@/types/takip";
import { isPlannedOn } from "@/lib/takip/aliskanlik-schedule";
import { addDaysISO } from "@/lib/date/istanbul";
import { fieldClass, goldBtn } from "./api";

export function EveningRitualCard({
  today,
  habits,
  logs,
  kayit,
  sablon,
  pending,
  onToggle,
  onIlkDavranis,
  onSaveSablon,
}: {
  today: string;
  habits: Aliskanlik[];
  logs: Parameters<typeof isPlannedOn>[2];
  kayit: AliskanlikAksamKayit | null;
  sablon: AliskanlikAltAdim[];
  pending?: boolean;
  onToggle: (kod: string, deger: boolean) => void;
  onIlkDavranis: (value: string) => void;
  onSaveSablon: (adimlar: AliskanlikAltAdim[]) => void;
}) {
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(sablon);
  const yarin = addDaysISO(today, 1);
  const yarinPlan = useMemo(
    () =>
      habits.filter(
        (h) => h.aktif && !h.arsivlendi && isPlannedOn(h, yarin, logs)
      ),
    [habits, logs, yarin]
  );
  const done = sablon.filter((s) => kayit?.adimlar[s.kod]).length;

  return (
    <section className="rounded-2xl border border-[#e8e0d4] bg-white/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#6b6158]">
            Akşam hazırlığı
          </p>
          <p className="mt-1 text-sm text-[#1a1612]">
            Birkaç dakika. Yarını kolaylaştır.
          </p>
        </div>
        <span className="text-xs text-[#6b6158]">
          {done}/{sablon.length}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {sablon.map((s) => {
          const on = Boolean(kayit?.adimlar[s.kod]);
          return (
            <li key={s.kod}>
              <label className="flex items-start gap-2.5 text-sm text-[#1a1612]">
                <input
                  type="checkbox"
                  checked={on}
                  disabled={pending}
                  onChange={(e) => onToggle(s.kod, e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#e8e0d4]"
                />
                <span className={on ? "text-[#1a1612]/50" : ""}>{s.ad}</span>
              </label>
              {s.kod === "ilk_davranis" ? (
                <select
                  value={kayit?.ilk_davranis ?? ""}
                  disabled={pending}
                  onChange={(e) => onIlkDavranis(e.target.value)}
                  className={`${fieldClass} mt-1.5`}
                >
                  <option value="">Yarının ilk davranışı…</option>
                  {yarinPlan.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.ad}
                    </option>
                  ))}
                </select>
              ) : null}
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => {
          setDraft(sablon);
          setEdit((o) => !o);
        }}
        className="mt-3 text-xs text-[#6b6158] underline-offset-2 hover:underline"
      >
        {edit ? "Adımları gizle" : "Adımları düzenle"}
      </button>
      {edit ? (
        <div className="mt-3 space-y-2">
          {draft.map((s, i) => (
            <div key={s.kod} className="flex gap-2">
              <input
                value={s.ad}
                onChange={(e) =>
                  setDraft((p) =>
                    p.map((x, j) => (j === i ? { ...x, ad: e.target.value } : x))
                  )
                }
                className={fieldClass}
              />
            </div>
          ))}
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              onSaveSablon(draft.filter((s) => s.ad.trim()));
              setEdit(false);
            }}
            className={goldBtn}
          >
            Şablonu kaydet
          </button>
        </div>
      ) : null}
    </section>
  );
}
