"use client";

import { useEffect, useMemo, useState } from "react";

const GUNLER = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const SAATLER = Array.from({ length: 24 }, (_, i) => i);

function SaatHeatmap({ veri }: { veri: Record<string, number> }) {
  const maks = Math.max(...Object.values(veri), 1);

  return (
    <div className="overflow-x-auto">
      <div
        className="inline-grid gap-1"
        style={{ gridTemplateColumns: "auto repeat(24, 1.5rem)" }}
      >
        <div />
        {SAATLER.map((s) => (
          <div
            key={s}
            className="w-6 text-center text-[10px] text-[#6b6158]"
          >
            {s % 6 === 0 ? `${s}` : ""}
          </div>
        ))}

        {GUNLER.map((gun, g) => (
          <div key={gun} className="contents">
            <div className="flex items-center pr-2 text-xs text-[#6b6158]">
              {gun}
            </div>
            {SAATLER.map((s) => {
              const anahtar = `${g}-${s}`;
              const deger = veri[anahtar] ?? 0;
              const yogunluk = deger / maks;
              return (
                <div
                  key={anahtar}
                  title={`${gun} ${s}:00 — ${deger} görüntülenme`}
                  className="h-6 w-6 rounded-sm"
                  style={{
                    backgroundColor:
                      yogunluk > 0
                        ? `rgba(184, 147, 74, ${0.15 + yogunluk * 0.85})`
                        : "rgba(26, 22, 18, 0.06)",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SaatAnalizTab() {
  const [veri, setVeri] = useState<Record<string, number>>({});
  const [toplam, setToplam] = useState(0);
  const [gun, setGun] = useState(30);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/icerik/saat-analiz");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setVeri(data.veri ?? {});
        setToplam(typeof data.toplam === "number" ? data.toplam : 0);
        setGun(typeof data.gun === "number" ? data.gun : 30);
      } finally {
        if (!cancelled) setYukleniyor(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const zirve = useMemo(() => {
    let bestKey = "";
    let best = 0;
    for (const [k, v] of Object.entries(veri)) {
      if (v > best) {
        best = v;
        bestKey = k;
      }
    }
    if (!bestKey || best === 0) return null;
    const [g, s] = bestKey.split("-").map(Number);
    return { gun: GUNLER[g] ?? "", saat: s, deger: best };
  }, [veri]);

  if (yukleniyor) {
    return <p className="text-sm text-[#6b6158]">Yükleniyor…</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="admin-section-title">Saat analizi</h2>
        <p className="mt-1 text-sm text-[#6b6158]">
          Son {gun} gün · İstanbul saati · {toplam} görüntülenme
          {zirve
            ? ` · en yoğun ${zirve.gun} ${String(zirve.saat).padStart(2, "0")}:00 (${zirve.deger})`
            : ""}
        </p>
      </div>

      {toplam === 0 ? (
        <p className="rounded-xl border border-[#e8e0d4] bg-white/60 px-4 py-8 text-center text-sm text-[#6b6158]">
          Henüz ziyaret kaydı yok. Site gezildikçe ızgara dolacak.
        </p>
      ) : (
        <div className="rounded-2xl border border-[#e8e0d4] bg-white/70 p-4 sm:p-5">
          <SaatHeatmap veri={veri} />
          <p className="mt-3 text-[11px] text-[#6b6158]/80">
            Sütunlar saat (0–23). Koyu altın = daha çok görüntülenme.
          </p>
        </div>
      )}
    </div>
  );
}
