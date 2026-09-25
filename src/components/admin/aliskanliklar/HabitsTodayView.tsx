"use client";

import type {
  Aliskanlik,
  AliskanlikGunModu,
  AliskanlikKayit,
} from "@/types/takip";
import { isoWeekday } from "@/lib/date/istanbul";
import {
  isOptionalToday,
  isPlannedOn,
  missedLastPlanned,
} from "@/lib/takip/aliskanlik-schedule";
import { anaDilPlanKodu } from "@/lib/takip/aliskanlik-plan";
import { isAliskanlikKayitDone } from "@/lib/takip/aliskanlik-done";
import {
  ZAMAN_SLOT_LABEL,
  zamanSlot,
  type ZamanSlot,
} from "@/lib/takip/aliskanlik-progress";
import { HabitCard, type KayitPayload } from "./HabitCard";

const SLOT_ORDER: ZamanSlot[] = [
  "sabah",
  "gunduz",
  "yolculuk",
  "aksam",
  "gun_boyu",
];

export function HabitsTodayView({
  habits,
  logs,
  today,
  gunModu,
  pendingId,
  onKayit,
}: {
  habits: Aliskanlik[];
  logs: AliskanlikKayit[];
  today: string;
  gunModu: AliskanlikGunModu;
  pendingId: string | null;
  onKayit: (payload: KayitPayload) => void;
}) {
  const spor = habits.find((h) => h.plan_kodu === "spor");
  const sporDone = spor
    ? logs.some(
        (l) =>
          l.aliskanlik_id === spor.id &&
          l.tarih === today &&
          isAliskanlikKayitDone(l)
      )
    : false;
  const anaDil = anaDilPlanKodu(isoWeekday(today));

  const planned = habits.filter(
    (h) => h.aktif && !h.arsivlendi && isPlannedOn(h, today, logs)
  );
  const optional = habits.filter(
    (h) => h.aktif && !h.arsivlendi && isOptionalToday(h)
  );

  const groups = SLOT_ORDER.map((slot) => ({
    slot,
    items: planned.filter((h) => zamanSlot(h.zaman_dilimi) === slot),
  })).filter((g) => g.items.length > 0);

  if (planned.length === 0 && optional.length === 0) {
    return (
      <p className="text-sm text-[#1a1612]/40">
        Bugün planlı alışkanlık yok. Hazır planı kurabilir veya yeni bir
        alışkanlık ekleyebilirsin.
      </p>
    );
  }

  function card(h: Aliskanlik, missed: boolean) {
    const kayit = logs.find(
      (l) => l.aliskanlik_id === h.id && l.tarih === today
    );
    const isLang = h.ozel_tur === "dil";
    const primaryLang = isLang && anaDil !== "tekrar" && h.plan_kodu === anaDil;
    const microLang = isLang && anaDil !== "tekrar" && h.plan_kodu !== anaDil;
    return (
      <HabitCard
        key={h.id}
        habit={h}
        kayit={kayit}
        logs={logs}
        today={today}
        gunModu={gunModu}
        missed={missed}
        pending={pendingId === h.id}
        primaryLang={primaryLang}
        microLang={microLang}
        karsilayanDone={
          Boolean(h.karsilayan_aliskanlik_id) && sporDone
        }
        onKayit={onKayit}
      />
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <section key={g.slot}>
          <h2 className="mb-3 text-xs uppercase tracking-wider text-[#6b6158]">
            {ZAMAN_SLOT_LABEL[g.slot]}
          </h2>
          <div className="space-y-3">
            {g.items.map((h) => {
              const missed =
                gunModu === "normal" && missedLastPlanned(h, today, logs);
              return card(h, missed);
            })}
          </div>
        </section>
      ))}
      {optional.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xs uppercase tracking-wider text-[#6b6158]">
            Esnek
          </h2>
          <div className="space-y-3">
            {optional.map((h) => card(h, false))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
