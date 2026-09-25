"use client";

import { useState } from "react";
import type {
  Aliskanlik,
  AliskanlikGunModu,
  AliskanlikKayit,
  AliskanlikKayitDurum,
  AliskanlikKayitEkstra,
} from "@/types/takip";
import { isAliskanlikKayitDone } from "@/lib/takip/aliskanlik-done";
import { altDoneCount } from "@/lib/takip/aliskanlik-progress";
import { SOSYAL_ALTERNATIFLER, anaDilPlanKodu } from "@/lib/takip/aliskanlik-plan";
import { isoWeekday } from "@/lib/date/istanbul";
import { WeekStrip } from "./WeekStrip";
import { RecordButtons } from "./RecordButtons";
import { SubstepSummary, SubstepToggles } from "./SubstepToggles";
import { chipClass, fieldClass, goldBtn } from "./api";

export type KayitPayload = {
  aliskanlik_id: string;
  tarih: string;
  durum?: AliskanlikKayitDurum;
  deger?: number | null;
  alt_adim_kod?: string;
  alt_adim_deger?: boolean;
  ekstra?: AliskanlikKayitEkstra;
  geri_al?: boolean;
  tamamlandi?: boolean;
};

function Shell({
  habit,
  kayit,
  logs,
  today,
  missed,
  children,
}: {
  habit: Aliskanlik;
  kayit: AliskanlikKayit | undefined;
  logs: AliskanlikKayit[];
  today: string;
  missed: boolean;
  children: React.ReactNode;
}) {
  const done = kayit ? isAliskanlikKayitDone(kayit) : false;
  return (
    <article className="rounded-2xl border border-[#e8e0d4] bg-white/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`text-sm font-medium ${
              done ? "text-[#1a1612]/50" : "text-[#1a1612]"
            }`}
          >
            {habit.ad}
          </h3>
          {habit.kimlik_ifadesi ? (
            <p className="mt-0.5 text-[11px] leading-snug text-[#6b6158]">
              {habit.kimlik_ifadesi}
            </p>
          ) : null}
          {habit.tetikleyici ? (
            <p className="mt-1 text-[11px] text-[#1a1612]/50">
              {habit.tetikleyici}
            </p>
          ) : null}
        </div>
        <WeekStrip habit={habit} logs={logs} today={today} />
      </div>
      {missed ? (
        <p className="mt-3 rounded-xl bg-[#1a1612]/5 px-3 py-2 text-xs leading-relaxed text-[#6b6158]">
          Dün yapılamadı. Bugün yalnızca minimum sürümü tamamlayarak geri
          dönebilirsin.
        </p>
      ) : null}
      <div className="mt-3 space-y-3">{children}</div>
    </article>
  );
}

export function HabitCard(props: {
  habit: Aliskanlik;
  kayit: AliskanlikKayit | undefined;
  logs: AliskanlikKayit[];
  today: string;
  gunModu: AliskanlikGunModu;
  missed: boolean;
  pending?: boolean;
  primaryLang?: boolean;
  microLang?: boolean;
  karsilayanDone?: boolean;
  onKayit: (payload: KayitPayload) => void;
}) {
  const { habit } = props;
  if (habit.ozel_tur === "namaz") return <PrayerHabitCard {...props} />;
  if (habit.ozel_tur === "ogun") return <MealHabitCard {...props} />;
  if (habit.ozel_tur === "dil") return <LanguageRotationCard {...props} />;
  if (habit.ozel_tur === "icerik_hatti") return <ContentPipelineCard {...props} />;
  if (habit.ozel_tur === "sosyal") return <SocialHabitCard {...props} />;
  if (habit.ozel_tur === "uyku") return <SleepHabitCard {...props} />;
  if (habit.ozel_tur === "yolculuk") return <JourneyHabitCard {...props} />;
  return <GenericHabitCard {...props} />;
}

function GenericHabitCard({
  habit,
  kayit,
  logs,
  today,
  gunModu,
  missed,
  pending,
  karsilayanDone,
  onKayit,
}: {
  habit: Aliskanlik;
  kayit: AliskanlikKayit | undefined;
  logs: AliskanlikKayit[];
  today: string;
  gunModu: AliskanlikGunModu;
  missed: boolean;
  pending?: boolean;
  karsilayanDone?: boolean;
  onKayit: (payload: KayitPayload) => void;
}) {
  const [showVal, setShowVal] = useState(false);
  const [val, setVal] = useState(String(kayit?.deger ?? ""));
  const deger = kayit?.deger ?? 0;
  const min = habit.minimum_deger;
  const hedef = habit.hedef_deger;
  const birim = habit.birim ? ` ${habit.birim}` : "";
  const emphasizeMin = gunModu !== "normal" || missed;

  function send(partial: Omit<KayitPayload, "aliskanlik_id" | "tarih">) {
    onKayit({ aliskanlik_id: habit.id, tarih: today, ...partial });
  }

  return (
    <Shell habit={habit} kayit={kayit} logs={logs} today={today} missed={missed}>
      {min != null || hedef != null ? (
        <p className="text-sm text-[#1a1612]">
          {deger}
          {hedef != null ? ` / ${hedef}` : ""}
          {birim}
          {min != null ? (
            <span className="ml-2 text-xs text-[#6b6158]">min {min}</span>
          ) : null}
        </p>
      ) : null}
      {min != null ? (
        <button
          type="button"
          disabled={pending}
          className={chipClass}
          onClick={() => send({ deger: deger + min })}
        >
          +{min}
          {birim}
        </button>
      ) : null}
      {karsilayanDone ? (
        <p className="text-xs text-[#6b6158]">
          Spor salonu bugünkü hareketi karşılayabilir. İstersen yine de kısa bir
          esneme bırak.
        </p>
      ) : null}
      <RecordButtons
        pending={pending}
        emphasizeMin={emphasizeMin}
        showValue={min != null || hedef != null}
        onValue={() => setShowVal((o) => !o)}
        onDurum={(durum) => {
          let next = deger;
          if (durum === "minimum" && min != null) next = Math.max(deger, min);
          if (durum === "hedef" && hedef != null) next = Math.max(deger, hedef);
          if (durum === "bonus" && hedef != null) next = Math.max(deger, hedef + 1);
          send({
            durum,
            deger: min != null || hedef != null ? next : kayit?.deger,
          });
        }}
        onPlanliDegil={() => send({ durum: "planli_degil" })}
        onGeriAl={() => send({ geri_al: true })}
      />
      {showVal ? (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(val);
            if (!Number.isFinite(n)) return;
            send({ deger: n });
            setShowVal(false);
          }}
        >
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            type="number"
            step="any"
            className={fieldClass}
            aria-label="Değer"
          />
          <button type="submit" className={goldBtn} disabled={pending}>
            Kaydet
          </button>
        </form>
      ) : null}
    </Shell>
  );
}

function PrayerHabitCard({
  habit,
  kayit,
  logs,
  today,
  missed,
  pending,
  onKayit,
}: {
  habit: Aliskanlik;
  kayit: AliskanlikKayit | undefined;
  logs: AliskanlikKayit[];
  today: string;
  gunModu: AliskanlikGunModu;
  missed: boolean;
  pending?: boolean;
  onKayit: (payload: KayitPayload) => void;
}) {
  const { done, total } = altDoneCount(habit, kayit);
  return (
    <Shell habit={habit} kayit={kayit} logs={logs} today={today} missed={missed}>
      <p className="text-sm text-[#1a1612]">
        {done}/{total} vakit
      </p>
      <SubstepToggles
        habit={habit}
        kayit={kayit}
        pending={pending}
        onToggle={(kod, next) =>
          onKayit({
            aliskanlik_id: habit.id,
            tarih: today,
            alt_adim_kod: kod,
            alt_adim_deger: next,
          })
        }
      />
      <button
        type="button"
        className={chipClass}
        disabled={pending}
        onClick={() =>
          onKayit({ aliskanlik_id: habit.id, tarih: today, geri_al: true })
        }
      >
        Geri al
      </button>
    </Shell>
  );
}

function MealHabitCard({
  habit,
  kayit,
  logs,
  today,
  missed,
  pending,
  onKayit,
}: {
  habit: Aliskanlik;
  kayit: AliskanlikKayit | undefined;
  logs: AliskanlikKayit[];
  today: string;
  gunModu: AliskanlikGunModu;
  missed: boolean;
  pending?: boolean;
  onKayit: (payload: KayitPayload) => void;
}) {
  const ana = altDoneCount(habit, kayit, "ana_ogun");
  const ara = altDoneCount(habit, kayit, "ara_ogun");
  return (
    <Shell habit={habit} kayit={kayit} logs={logs} today={today} missed={missed}>
      <p className="text-sm text-[#1a1612]">
        {ana.done}/{ana.total} ana öğün
        <span className="ml-2 text-xs text-[#6b6158]">
          {ara.done}/{ara.total} ara öğün
        </span>
      </p>
      <SubstepToggles
        habit={habit}
        kayit={kayit}
        pending={pending}
        onToggle={(kod, next) =>
          onKayit({
            aliskanlik_id: habit.id,
            tarih: today,
            alt_adim_kod: kod,
            alt_adim_deger: next,
          })
        }
      />
    </Shell>
  );
}

function LanguageRotationCard(props: {
  habit: Aliskanlik;
  kayit: AliskanlikKayit | undefined;
  logs: AliskanlikKayit[];
  today: string;
  gunModu: AliskanlikGunModu;
  missed: boolean;
  pending?: boolean;
  primaryLang?: boolean;
  microLang?: boolean;
  onKayit: (payload: KayitPayload) => void;
}) {
  const weekly = anaDilPlanKodu(isoWeekday(props.today)) === "tekrar";
  const badge = weekly
    ? "Haftalık tekrar — ağır ders değil."
    : props.primaryLang
      ? "Bugünün ana dili"
      : props.microLang
        ? "Mikro tekrar yeterli."
        : null;
  return (
    <div>
      {badge ? (
        <p
          className={`mb-1 text-xs ${
            props.primaryLang ? "text-[#b8934a]" : "text-[#6b6158]"
          }`}
        >
          {badge}
        </p>
      ) : null}
      <GenericHabitCard
        {...props}
        missed={props.missed && Boolean(props.primaryLang)}
      />
    </div>
  );
}

function ContentPipelineCard({
  habit,
  kayit,
  logs,
  today,
  missed,
  pending,
  onKayit,
}: {
  habit: Aliskanlik;
  kayit: AliskanlikKayit | undefined;
  logs: AliskanlikKayit[];
  today: string;
  gunModu: AliskanlikGunModu;
  missed: boolean;
  pending?: boolean;
  onKayit: (payload: KayitPayload) => void;
}) {
  return (
    <Shell habit={habit} kayit={kayit} logs={logs} today={today} missed={missed}>
      <SubstepSummary habit={habit} kayit={kayit} />
      <SubstepToggles
        habit={habit}
        kayit={kayit}
        pending={pending}
        sequential
        onToggle={(kod, next) =>
          onKayit({
            aliskanlik_id: habit.id,
            tarih: today,
            alt_adim_kod: kod,
            alt_adim_deger: next,
          })
        }
      />
    </Shell>
  );
}

function SocialHabitCard({
  habit,
  kayit,
  logs,
  today,
  missed,
  pending,
  onKayit,
}: {
  habit: Aliskanlik;
  kayit: AliskanlikKayit | undefined;
  logs: AliskanlikKayit[];
  today: string;
  gunModu: AliskanlikGunModu;
  missed: boolean;
  pending?: boolean;
  onKayit: (payload: KayitPayload) => void;
}) {
  const niyet = kayit?.ekstra.sosyal_niyet;
  return (
    <Shell habit={habit} kayit={kayit} logs={logs} today={today} missed={missed}>
      <p className="text-xs text-[#6b6158]">İsteğe bağlı. Engel değil.</p>
      <SubstepToggles
        habit={habit}
        kayit={kayit}
        pending={pending}
        onToggle={(kod, next) =>
          onKayit({
            aliskanlik_id: habit.id,
            tarih: today,
            alt_adim_kod: kod,
            alt_adim_deger: next,
            ekstra:
              kod === "can_sikintisi" && next
                ? { sosyal_niyet: "can_sikintisi" }
                : undefined,
          })
        }
      />
      {niyet === "can_sikintisi" || kayit?.alt_adimlar.can_sikintisi ? (
        <ul className="rounded-xl bg-[#1a1612]/5 px-3 py-2 text-xs text-[#6b6158]">
          {SOSYAL_ALTERNATIFLER.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      ) : null}
    </Shell>
  );
}

function SleepHabitCard({
  habit,
  kayit,
  logs,
  today,
  missed,
  pending,
  onKayit,
}: {
  habit: Aliskanlik;
  kayit: AliskanlikKayit | undefined;
  logs: AliskanlikKayit[];
  today: string;
  gunModu: AliskanlikGunModu;
  missed: boolean;
  pending?: boolean;
  onKayit: (payload: KayitPayload) => void;
}) {
  const [yatis, setYatis] = useState(kayit?.ekstra.yatis_saati ?? "");
  const [uyanis, setUyanis] = useState(kayit?.ekstra.uyanis_saati ?? "");
  const [hedefYatis, setHedefYatis] = useState(
    kayit?.ekstra.hedef_yatis ?? "23:30"
  );
  return (
    <Shell habit={habit} kayit={kayit} logs={logs} today={today} missed={missed}>
      <SubstepToggles
        habit={habit}
        kayit={kayit}
        pending={pending}
        onToggle={(kod, next) =>
          onKayit({
            aliskanlik_id: habit.id,
            tarih: today,
            alt_adim_kod: kod,
            alt_adim_deger: next,
          })
        }
      />
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="text-xs text-[#6b6158]">
          Hedef yatış
          <input
            type="time"
            value={hedefYatis}
            onChange={(e) => setHedefYatis(e.target.value)}
            onBlur={() =>
              onKayit({
                aliskanlik_id: habit.id,
                tarih: today,
                ekstra: { hedef_yatis: hedefYatis },
                durum: kayit?.durum ?? "minimum",
              })
            }
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="text-xs text-[#6b6158]">
          Yatış
          <input
            type="time"
            value={yatis}
            onChange={(e) => setYatis(e.target.value)}
            onBlur={() =>
              onKayit({
                aliskanlik_id: habit.id,
                tarih: today,
                ekstra: { yatis_saati: yatis },
                durum: kayit?.durum ?? "minimum",
              })
            }
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="text-xs text-[#6b6158]">
          Uyanış
          <input
            type="time"
            value={uyanis}
            onChange={(e) => setUyanis(e.target.value)}
            onBlur={() =>
              onKayit({
                aliskanlik_id: habit.id,
                tarih: today,
                ekstra: { uyanis_saati: uyanis },
                durum: kayit?.durum ?? "minimum",
              })
            }
            className={`${fieldClass} mt-1`}
          />
        </label>
      </div>
    </Shell>
  );
}

function JourneyHabitCard({
  habit,
  kayit,
  logs,
  today,
  missed,
  pending,
  onKayit,
}: {
  habit: Aliskanlik;
  kayit: AliskanlikKayit | undefined;
  logs: AliskanlikKayit[];
  today: string;
  gunModu: AliskanlikGunModu;
  missed: boolean;
  pending?: boolean;
  onKayit: (payload: KayitPayload) => void;
}) {
  return (
    <Shell habit={habit} kayit={kayit} logs={logs} today={today} missed={missed}>
      <p className="text-xs text-[#6b6158]">
        Her yolculuğu üretkenliğe çevirmek zorunda değilsin.
      </p>
      <SubstepToggles
        habit={habit}
        kayit={kayit}
        pending={pending}
        onToggle={(kod, next) =>
          onKayit({
            aliskanlik_id: habit.id,
            tarih: today,
            alt_adim_kod: kod,
            alt_adim_deger: next,
          })
        }
      />
      <button
        type="button"
        className={chipClass}
        disabled={pending}
        onClick={() =>
          onKayit({
            aliskanlik_id: habit.id,
            tarih: today,
            durum: "planli_degil",
          })
        }
      >
        Bugün planlı değil
      </button>
    </Shell>
  );
}
