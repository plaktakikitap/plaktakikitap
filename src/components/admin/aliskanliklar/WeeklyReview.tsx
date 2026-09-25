"use client";

import { useState } from "react";
import type {
  Aliskanlik,
  AliskanlikHaftalikDegerlendirme,
  AliskanlikKayit,
  AliskanlikSorunTuru,
} from "@/types/takip";
import { startOfIsoWeekISO } from "@/lib/date/istanbul";
import { haftalikOneriler } from "@/lib/takip/aliskanlik-review";
import { fieldClass, goldBtn } from "./api";

const SORUN: { id: AliskanlikSorunTuru; ad: string }[] = [
  { id: "zaman", ad: "Zaman" },
  { id: "ortam", ad: "Ortam" },
  { id: "tetikleyici", ad: "Tetikleyici" },
  { id: "zorluk", ad: "Zorluk" },
  { id: "enerji", ad: "Enerji" },
];

export function WeeklyReview({
  habits,
  logs,
  today,
  existing,
  pending,
  onSave,
}: {
  habits: Aliskanlik[];
  logs: AliskanlikKayit[];
  today: string;
  existing: AliskanlikHaftalikDegerlendirme | null;
  pending?: boolean;
  onSave: (body: Record<string, unknown>) => void;
}) {
  const hafta = startOfIsoWeekISO(today);
  const oneriler = haftalikOneriler(habits, logs, today);
  const [dogal, setDogal] = useState(existing?.dogal_akan ?? "");
  const [zor, setZor] = useState(existing?.zorlanan ?? "");
  const [sorun, setSorun] = useState<AliskanlikSorunTuru | "">(
    existing?.sorun_turu ?? ""
  );
  const [buyuk, setBuyuk] = useState(existing?.buyuk_hedef ?? "");
  const [kucult, setKucult] = useState(existing?.kucultme ?? "");
  const [ust, setUst] = useState(existing?.ust_seviye ?? "");
  const [notlar, setNotlar] = useState(existing?.notlar ?? "");

  return (
    <section className="space-y-4">
      <p className="text-sm text-[#6b6158]">
        Hafta başlangıcı {hafta}. Öneriler son 7 günün kayıtlarından, kurala
        göre üretilir.
      </p>
      {oneriler.length > 0 ? (
        <ul className="space-y-2 rounded-2xl border border-[#e8e0d4] bg-white/60 p-4">
          {oneriler.map((o) => (
            <li key={o.aliskanlik_id} className="text-sm text-[#1a1612]">
              {o.metin}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#1a1612]/40">Bu hafta için öneri yok.</p>
      )}
      <form
        className="space-y-3 rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            action: "haftalik",
            hafta_baslangici: hafta,
            dogal_akan: dogal,
            zorlanan: zor,
            sorun_turu: sorun || null,
            buyuk_hedef: buyuk,
            kucultme: kucult,
            ust_seviye: ust,
            notlar,
          });
        }}
      >
        <textarea
          value={dogal}
          onChange={(e) => setDogal(e.target.value)}
          placeholder="Bu hafta hangisi doğal aktı?"
          rows={2}
          className={`${fieldClass} resize-y`}
        />
        <textarea
          value={zor}
          onChange={(e) => setZor(e.target.value)}
          placeholder="Hangisinde sürekli zorlandım?"
          rows={2}
          className={`${fieldClass} resize-y`}
        />
        <select
          value={sorun}
          onChange={(e) =>
            setSorun(e.target.value as AliskanlikSorunTuru | "")
          }
          className={fieldClass}
        >
          <option value="">Sorun: zaman / ortam / tetikleyici / zorluk / enerji</option>
          {SORUN.map((s) => (
            <option key={s.id} value={s.id}>
              {s.ad}
            </option>
          ))}
        </select>
        <input
          value={buyuk}
          onChange={(e) => setBuyuk(e.target.value)}
          placeholder="Hangi hedef gereğinden büyüktü?"
          className={fieldClass}
        />
        <input
          value={kucult}
          onChange={(e) => setKucult(e.target.value)}
          placeholder="Gelecek hafta neyi küçültmeliyim?"
          className={fieldClass}
        />
        <input
          value={ust}
          onChange={(e) => setUst(e.target.value)}
          placeholder="Hangisi bir üst seviyeye çıkabilir?"
          className={fieldClass}
        />
        <textarea
          value={notlar}
          onChange={(e) => setNotlar(e.target.value)}
          placeholder="Kısa haftalık not"
          rows={2}
          className={`${fieldClass} resize-y`}
        />
        <button type="submit" disabled={pending} className={goldBtn}>
          Değerlendirmeyi kaydet
        </button>
      </form>
    </section>
  );
}
