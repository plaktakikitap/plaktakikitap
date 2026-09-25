"use client";

import type { Yapilacak } from "@/types/kisisel";
import type {
  Aliskanlik,
  AliskanlikKayit,
  BeslenmeKayit,
  FinansKayit,
  SporKayit,
} from "@/types/takip";
import type { Book } from "@/types/database";
import { lastNDaysISO, istanbulMonthISO, istanbulTodayISO, addDaysISO } from "@/lib/date/istanbul";
import { isAliskanlikKayitDone } from "@/lib/takip/aliskanlik-streak";

export function AdminIstatistiklerPanel({
  yapilacaklar,
  beslenme,
  spor,
  finansKayitlari,
  aliskanlikKayitlari,
  aliskanliklar,
  books,
}: {
  yapilacaklar: Yapilacak[];
  beslenme: BeslenmeKayit[];
  spor: SporKayit[];
  finansKayitlari: FinansKayit[];
  aliskanlikKayitlari: AliskanlikKayit[];
  aliskanliklar: Aliskanlik[];
  books: Book[];
}) {
  const toplamGorev = yapilacaklar.length;
  const tamamlanan = yapilacaklar.filter((x) => x.tamamlandi).length;
  const bekleyen = toplamGorev - tamamlanan;
  const acil = yapilacaklar.filter(
    (x) => x.oncelik === "acil" && !x.tamamlandi
  ).length;

  const okunanlar = books.filter((b) => b.status === "finished").length;
  const okuyorum = books.filter((b) => b.status === "reading").length;
  const okunacaklar = books.filter((b) => b.status === "to_read").length;

  const buAy = istanbulMonthISO();
  const buAyKayitlar = finansKayitlari.filter((k) => k.tarih?.startsWith(buAy));
  const gelir = buAyKayitlar
    .filter((k) => k.tur === "gelir")
    .reduce((s, k) => s + (k.tutar ?? 0), 0);
  const gider = buAyKayitlar
    .filter((k) => k.tur === "gider")
    .reduce((s, k) => s + (k.tutar ?? 0), 0);
  const net = gelir - gider;

  const son30 = lastNDaysISO(30);
  const son30Set = new Set(son30);
  const sporGunleri = new Set(spor.map((s) => s.tarih));
  const sporSayisi = son30.filter((d) => sporGunleri.has(d)).length;

  const ogunSayisi = beslenme.filter((b) => son30Set.has(b.tarih)).length;

  const aktifAliskanliklar = aliskanliklar.filter(
    (a) => a.aktif && !a.arsivlendi
  );
  const aktifIds = new Set(aktifAliskanliklar.map((a) => a.id));
  const kayitliGunler = new Set(
    aliskanlikKayitlari
      .filter((k) => isAliskanlikKayitDone(k) && aktifIds.has(k.aliskanlik_id))
      .map((k) => k.tarih)
  );
  const bugun = istanbulTodayISO();
  let streak = 0;
  let cursor = kayitliGunler.has(bugun) ? bugun : addDaysISO(bugun, -1);
  for (let i = 0; i < 365; i++) {
    if (!kayitliGunler.has(cursor)) break;
    streak += 1;
    cursor = addDaysISO(cursor, -1);
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label="Bekleyen görev"
          value={bekleyen}
          sub={acil > 0 ? `${acil} acil` : undefined}
          accent="amber"
        />
        <StatTile
          label="Kitap okudum"
          value={okunanlar}
          sub={`${okuyorum} okuyorum · ${okunacaklar} listede`}
          accent="gold"
        />
        <StatTile
          label="Bu ay net"
          value={`${net > 0 ? "+" : ""}${net.toLocaleString("tr-TR")} ₺`}
          sub={`${gelir.toLocaleString("tr-TR")} ₺ gelir`}
          accent={gelir >= gider ? "green" : "red"}
        />
        <StatTile
          label="Spor (30 gün)"
          value={sporSayisi}
          sub={`${Math.round((sporSayisi / 30) * 100)}% gün`}
          accent="amber"
        />
      </div>

      {aktifAliskanliklar.length > 0 ? (
        <section className="rounded-2xl border border-[#e8e0d4] bg-white/60 p-5">
          <h2 className="mb-4 text-sm font-medium text-[#1a1612]/70">
            Alışkanlıklar
          </h2>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-semibold text-[#b8934a]">{streak}</p>
              <p className="mt-1 text-xs text-[#6b6158]">gün streak</p>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              {aktifAliskanliklar.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#b8934a]" />
                  <p className="truncate text-sm text-[#1a1612]">{a.ad}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-[#e8e0d4] bg-white/60 p-5">
        <h2 className="mb-4 text-sm font-medium text-[#1a1612]/70">
          Spor — son 30 gün
        </h2>
        <div className="flex flex-wrap gap-1">
          {son30.map((d) => (
            <div
              key={d}
              title={d}
              className={`h-4 w-4 rounded-sm ${
                sporGunleri.has(d) ? "bg-[#b8934a]" : "bg-[#1a1612]/8"
              }`}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-[#6b6158]">
          {sporSayisi} / 30 gün aktif
          {ogunSayisi > 0 ? ` · beslenme ${ogunSayisi} öğün` : ""}
        </p>
      </section>

      <section className="rounded-2xl border border-[#e8e0d4] bg-white/60 p-5">
        <h2 className="mb-4 text-sm font-medium text-[#1a1612]/70">
          Yapılacaklar
        </h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          {(["acil", "normal", "bekleyebilir"] as const).map((oncelik) => {
            const count = yapilacaklar.filter(
              (x) => x.oncelik === oncelik && !x.tamamlandi
            ).length;
            return (
              <div
                key={oncelik}
                className="rounded-xl border border-[#e8e0d4] bg-[#faf7f2] p-3"
              >
                <p
                  className={`text-xl font-semibold ${
                    oncelik === "acil"
                      ? "text-red-500"
                      : oncelik === "normal"
                        ? "text-[#b8934a]"
                        : "text-[#6b6158]"
                  }`}
                >
                  {count}
                </p>
                <p className="mt-1 text-xs text-[#6b6158] capitalize">
                  {oncelik}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-[#6b6158]">
          {tamamlanan} / {toplamGorev} tamamlandı
        </p>
      </section>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: "amber" | "gold" | "green" | "red";
}) {
  const valueColor = {
    amber: "text-[#b8934a]",
    gold: "text-[#b8934a]",
    green: "text-emerald-600",
    red: "text-red-500",
  }[accent];

  return (
    <div className="rounded-2xl border border-[#e8e0d4] bg-white/60 p-4">
      <p className="text-xs text-[#6b6158]">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold tabular-nums ${valueColor}`}>
        {value}
      </p>
      {sub ? <p className="mt-1 text-[10px] text-[#a09588]">{sub}</p> : null}
    </div>
  );
}
