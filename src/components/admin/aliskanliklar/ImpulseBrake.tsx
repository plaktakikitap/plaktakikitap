"use client";

import { useEffect, useMemo, useState } from "react";
import type { AliskanlikDurtu, AliskanlikDurtuSebep } from "@/types/takip";
import {
  DURTU_ALTERNATIFLER,
  durtuIstatistik,
} from "@/lib/takip/aliskanlik-now";
import { chipClass, fieldClass } from "./api";

const SEBEPLER: { id: AliskanlikDurtuSebep; ad: string }[] = [
  { id: "is", ad: "İş" },
  { id: "paylasim", ad: "Paylaşım" },
  { id: "mesaj", ad: "Mesaj" },
  { id: "merak", ad: "Merak" },
  { id: "can_sikintisi", ad: "Can sıkıntısı" },
];

const AMACLI: AliskanlikDurtuSebep[] = ["is", "paylasim", "mesaj"];

export function ImpulseBrake({
  records,
  pending,
  onStart,
  onClose,
}: {
  records: AliskanlikDurtu[];
  pending?: boolean;
  onStart: (input: {
    sebep: AliskanlikDurtuSebep;
    amac?: string | null;
    alternatif?: string | null;
  }) => Promise<AliskanlikDurtu | null>;
  onClose: (
    id: string,
    patch: {
      durum: AliskanlikDurtu["durum"];
      alternatif?: string | null;
    }
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [sebep, setSebep] = useState<AliskanlikDurtuSebep | null>(null);
  const [amac, setAmac] = useState("");
  const [aktif, setAktif] = useState<AliskanlikDurtu | null>(null);
  const [kalan, setKalan] = useState(0);
  const stats = useMemo(() => durtuIstatistik(records), [records]);

  useEffect(() => {
    if (!aktif || AMACLI.includes(aktif.sebep)) return;
    if (aktif.durum !== "bekliyor") return;
    const started = new Date(aktif.olusturma_tarihi).getTime();
    const end = started + 10 * 60_000;
    const tick = () => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setKalan(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [aktif]);

  const dakika = Math.floor(kalan / 60);
  const saniye = String(kalan % 60).padStart(2, "0");
  const sayacBitti = Boolean(aktif && !AMACLI.includes(aktif.sebep) && kalan === 0);

  return (
    <section className="rounded-2xl border border-[#e8e0d4] bg-white/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#1a1612]">Instagram’a girmek istiyorum</p>
        <button
          type="button"
          disabled={pending || Boolean(aktif)}
          onClick={() => setOpen(true)}
          className="rounded-xl border border-[#e8e0d4] px-3 py-1.5 text-xs text-[#1a1612] hover:bg-[#1a1612]/5 disabled:opacity-40"
        >
          Duraklat
        </button>
      </div>
      <p className="mt-1 text-[11px] text-[#6b6158]">
        Engel değil. İstek ile eylem arasına kısa bir boşluk.
      </p>

      {open && !aktif ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-[#6b6158]">Sebep (isteğe bağlı)</p>
          <div className="flex flex-wrap gap-1.5">
            {SEBEPLER.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSebep(s.id)}
                className={`rounded-lg px-2.5 py-1.5 text-xs ${
                  sebep === s.id
                    ? "bg-[#b8934a]/20 text-[#1a1612]"
                    : "border border-[#e8e0d4] text-[#6b6158]"
                }`}
              >
                {s.ad}
              </button>
            ))}
          </div>
          {sebep && AMACLI.includes(sebep) ? (
            <input
              value={amac}
              onChange={(e) => setAmac(e.target.value)}
              placeholder="Bu oturumda neyi bitirmek istiyorsun?"
              className={fieldClass}
            />
          ) : null}
          <button
            type="button"
            disabled={pending || !sebep}
            className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-medium text-[#1a1612] disabled:opacity-50"
            onClick={() => {
              if (!sebep) return;
              void onStart({
                sebep,
                amac: AMACLI.includes(sebep) ? amac : null,
                alternatif: AMACLI.includes(sebep)
                  ? null
                  : DURTU_ALTERNATIFLER[
                      records.length % DURTU_ALTERNATIFLER.length
                    ],
              }).then((row) => {
                if (row) {
                  setAktif(row);
                  setOpen(false);
                  setAmac("");
                }
              });
            }}
          >
            Kaydet
          </button>
        </div>
      ) : null}

      {aktif && AMACLI.includes(aktif.sebep) && aktif.durum === "bekliyor" ? (
        <div className="mt-3 space-y-2">
          {aktif.amac ? (
            <p className="text-sm text-[#1a1612]">Amaç: {aktif.amac}</p>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              onClose(aktif.id, { durum: "amac_tamamlandi" });
              setAktif(null);
              setSebep(null);
            }}
            className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-medium text-[#1a1612]"
          >
            Amacımı tamamladım
          </button>
        </div>
      ) : null}

      {aktif && !AMACLI.includes(aktif.sebep) && aktif.durum === "bekliyor" ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-[#1a1612]">
            {sayacBitti ? "On dakika doldu." : `${dakika}:${saniye}`}
          </p>
          {aktif.alternatif ? (
            <p className="text-xs text-[#6b6158]">
              İstersen: {aktif.alternatif}
            </p>
          ) : null}
          {sayacBitti ? (
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["istek_gecti", "İstek geçti"],
                  ["hala_istiyorum", "Hâlâ girmek istiyorum"],
                  ["alternatif_yapildi", "Alternatifi yaptım"],
                ] as const
              ).map(([durum, ad]) => (
                <button
                  key={durum}
                  type="button"
                  disabled={pending}
                  className={chipClass}
                  onClick={() => {
                    onClose(aktif.id, { durum });
                    setAktif(null);
                    setSebep(null);
                  }}
                >
                  {ad}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#6b6158]">
              Bekle. Uygulama Instagram’ı kapatmaz; yalnızca boşluk bırakır.
            </p>
          )}
        </div>
      ) : null}

      {stats.toplam > 0 ? (
        <ul className="mt-3 space-y-0.5 text-[11px] text-[#6b6158]">
          {stats.enSikSebep ? <li>En sık sebep: {stats.enSikSebep}</li> : null}
          {stats.enSikSaat ? <li>En sık saat: {stats.enSikSaat}</li> : null}
          <li>Bekledikten sonra geçen: {stats.gecti}</li>
          <li>Alternatife dönen: {stats.alternatif}</li>
        </ul>
      ) : null}
    </section>
  );
}
