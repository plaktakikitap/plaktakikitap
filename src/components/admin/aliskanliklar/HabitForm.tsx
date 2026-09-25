"use client";

import { useState } from "react";
import type {
  Aliskanlik,
  AliskanlikOzelTuru,
  AliskanlikProgramTuru,
  AliskanlikZamanDilimi,
} from "@/types/takip";
import { KIMLIK_KATALOG } from "@/lib/takip/aliskanlik-plan";
import { AdminOptionalSection } from "@/components/admin/AdminFormPrimitives";
import { fieldClass, goldBtn } from "./api";

const PROGRAM: { id: AliskanlikProgramTuru; ad: string }[] = [
  { id: "gunluk", ad: "Her gün" },
  { id: "belirli_gunler", ad: "Belirli günler" },
  { id: "iki_gunde_bir", ad: "İki günde bir" },
  { id: "haftada_x", ad: "Haftada X" },
  { id: "ayda_x", ad: "Ayda X" },
  { id: "esnek", ad: "Esnek" },
];

const ZAMAN: { id: AliskanlikZamanDilimi; ad: string }[] = [
  { id: "sabah", ad: "Sabah" },
  { id: "gunduz", ad: "Gün içinde" },
  { id: "aksam", ad: "Akşam" },
  { id: "gun_boyu", ad: "Gün boyu" },
  { id: "yolculuk", ad: "Yolculuk" },
];

const OZEL: { id: AliskanlikOzelTuru | ""; ad: string }[] = [
  { id: "", ad: "Yok" },
  { id: "namaz", ad: "Namaz" },
  { id: "ogun", ad: "Öğün" },
  { id: "dil", ad: "Dil" },
  { id: "yolculuk", ad: "Yolculuk" },
  { id: "icerik_hatti", ad: "İçerik hattı" },
  { id: "sosyal", ad: "Sosyal medya" },
  { id: "uyku", ad: "Uyku" },
];

const GUNLER = [
  { n: 1, ad: "Pzt" },
  { n: 2, ad: "Sal" },
  { n: 3, ad: "Çar" },
  { n: 4, ad: "Per" },
  { n: 5, ad: "Cum" },
  { n: 6, ad: "Cmt" },
  { n: 7, ad: "Paz" },
];

export type HabitFormValues = {
  ad: string;
  aciklama: string;
  kategori: string;
  kimlik_ifadesi: string;
  program_turu: AliskanlikProgramTuru;
  hedef_gunler: number[];
  hedef_siklik: string;
  birim: string;
  minimum_deger: string;
  hedef_deger: string;
  tetikleyici: string;
  zaman_dilimi: AliskanlikZamanDilimi;
  renk: string;
  ikon: string;
  sira: string;
  ozel_tur: AliskanlikOzelTuru | "";
};

function fromHabit(h?: Aliskanlik): HabitFormValues {
  return {
    ad: h?.ad ?? "",
    aciklama: h?.aciklama ?? "",
    kategori: h?.kategori ?? "",
    kimlik_ifadesi: h?.kimlik_ifadesi ?? "",
    program_turu: (h?.program_turu as AliskanlikProgramTuru) || "gunluk",
    hedef_gunler: h?.hedef_gunler ?? [],
    hedef_siklik: h?.hedef_siklik != null ? String(h.hedef_siklik) : "",
    birim: h?.birim ?? "",
    minimum_deger: h?.minimum_deger != null ? String(h.minimum_deger) : "",
    hedef_deger: h?.hedef_deger != null ? String(h.hedef_deger) : "",
    tetikleyici: h?.tetikleyici ?? "",
    zaman_dilimi: (h?.zaman_dilimi as AliskanlikZamanDilimi) || "gun_boyu",
    renk: h?.renk ?? "#b8934a",
    ikon: h?.ikon ?? "",
    sira: String(h?.sira ?? 0),
    ozel_tur: h?.ozel_tur ?? "",
  };
}

export function HabitForm({
  initial,
  loading,
  onSubmit,
  onCancel,
}: {
  initial?: Aliskanlik;
  loading?: boolean;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel?: () => void;
}) {
  const [v, setV] = useState<HabitFormValues>(() => fromHabit(initial));
  const [ozelKat, setOzelKat] = useState(
    () =>
      Boolean(
        v.kategori && !KIMLIK_KATALOG.some((k) => k.kategori === v.kategori)
      )
  );

  function patch<K extends keyof HabitFormValues>(key: K, val: HabitFormValues[K]) {
    setV((prev) => ({ ...prev, [key]: val }));
  }

  return (
    <form
      className="space-y-3 rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ad: v.ad,
          aciklama: v.aciklama || null,
          kategori: v.kategori || null,
          kimlik_ifadesi: v.kimlik_ifadesi || null,
          program_turu: v.program_turu,
          hedef_gunler: v.hedef_gunler,
          hedef_siklik: v.hedef_siklik ? Number(v.hedef_siklik) : null,
          birim: v.birim || null,
          minimum_deger: v.minimum_deger ? Number(v.minimum_deger) : null,
          hedef_deger: v.hedef_deger ? Number(v.hedef_deger) : null,
          tetikleyici: v.tetikleyici || null,
          zaman_dilimi: v.zaman_dilimi,
          renk: v.renk || null,
          ikon: v.ikon || null,
          sira: v.sira ? Number(v.sira) : 0,
          ozel_tur: v.ozel_tur || null,
        });
      }}
    >
      <input
        required
        value={v.ad}
        onChange={(e) => patch("ad", e.target.value)}
        placeholder="Alışkanlık adı"
        className={fieldClass}
      />
      <input
        value={v.tetikleyici}
        onChange={(e) => patch("tetikleyici", e.target.value)}
        placeholder="Tetikleyici (ör. namazdan sonra)"
        className={fieldClass}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <select
          value={ozelKat ? "__ozel" : v.kategori}
          onChange={(e) => {
            if (e.target.value === "__ozel") {
              setOzelKat(true);
              return;
            }
            setOzelKat(false);
            const hit = KIMLIK_KATALOG.find((k) => k.kategori === e.target.value);
            patch("kategori", e.target.value);
            if (hit) patch("kimlik_ifadesi", hit.kimlik);
          }}
          className={fieldClass}
        >
          <option value="">Kategori</option>
          {KIMLIK_KATALOG.map((k) => (
            <option key={k.kategori} value={k.kategori}>
              {k.kategori}
            </option>
          ))}
          <option value="__ozel">Yeni kategori…</option>
        </select>
        <select
          value={v.zaman_dilimi}
          onChange={(e) =>
            patch("zaman_dilimi", e.target.value as AliskanlikZamanDilimi)
          }
          className={fieldClass}
        >
          {ZAMAN.map((z) => (
            <option key={z.id} value={z.id}>
              {z.ad}
            </option>
          ))}
        </select>
      </div>
      {ozelKat ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={v.kategori}
            onChange={(e) => patch("kategori", e.target.value)}
            placeholder="Yeni kategori"
            className={fieldClass}
          />
          <input
            value={v.kimlik_ifadesi}
            onChange={(e) => patch("kimlik_ifadesi", e.target.value)}
            placeholder="Kimlik ifadesi"
            className={fieldClass}
          />
        </div>
      ) : (
        <input
          value={v.kimlik_ifadesi}
          onChange={(e) => patch("kimlik_ifadesi", e.target.value)}
          placeholder="Kimlik ifadesi"
          className={fieldClass}
        />
      )}
      <div className="grid gap-2 sm:grid-cols-3">
        <input
          value={v.minimum_deger}
          onChange={(e) => patch("minimum_deger", e.target.value)}
          placeholder="Minimum"
          type="number"
          step="any"
          className={fieldClass}
        />
        <input
          value={v.hedef_deger}
          onChange={(e) => patch("hedef_deger", e.target.value)}
          placeholder="Hedef"
          type="number"
          step="any"
          className={fieldClass}
        />
        <input
          value={v.birim}
          onChange={(e) => patch("birim", e.target.value)}
          placeholder="Birim"
          className={fieldClass}
        />
      </div>
      <AdminOptionalSection>
        <textarea
          value={v.aciklama}
          onChange={(e) => patch("aciklama", e.target.value)}
          placeholder="Açıklama"
          rows={2}
          className={`${fieldClass} resize-y`}
        />
        <select
          value={v.program_turu}
          onChange={(e) =>
            patch("program_turu", e.target.value as AliskanlikProgramTuru)
          }
          className={fieldClass}
        >
          {PROGRAM.map((p) => (
            <option key={p.id} value={p.id}>
              {p.ad}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-1.5">
          {GUNLER.map((g) => {
            const on = v.hedef_gunler.includes(g.n);
            return (
              <button
                key={g.n}
                type="button"
                onClick={() =>
                  patch(
                    "hedef_gunler",
                    on
                      ? v.hedef_gunler.filter((n) => n !== g.n)
                      : [...v.hedef_gunler, g.n].sort()
                  )
                }
                className={`rounded-lg border px-2 py-1 text-xs ${
                  on
                    ? "border-[#b8934a]/50 bg-[#b8934a]/15 text-[#1a1612]"
                    : "border-[#e8e0d4] text-[#6b6158]"
                }`}
              >
                {g.ad}
              </button>
            );
          })}
        </div>
        <input
          value={v.hedef_siklik}
          onChange={(e) => patch("hedef_siklik", e.target.value)}
          placeholder="Haftalık / aylık sıklık"
          type="number"
          className={fieldClass}
        />
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            value={v.sira}
            onChange={(e) => patch("sira", e.target.value)}
            placeholder="Sıra"
            type="number"
            className={fieldClass}
          />
          <input
            value={v.renk}
            onChange={(e) => patch("renk", e.target.value)}
            placeholder="Renk"
            className={fieldClass}
          />
          <input
            value={v.ikon}
            onChange={(e) => patch("ikon", e.target.value)}
            placeholder="İkon adı"
            className={fieldClass}
          />
        </div>
        <select
          value={v.ozel_tur}
          onChange={(e) =>
            patch("ozel_tur", e.target.value as AliskanlikOzelTuru | "")
          }
          className={fieldClass}
        >
          {OZEL.map((o) => (
            <option key={o.id} value={o.id}>
              {o.ad}
            </option>
          ))}
        </select>
      </AdminOptionalSection>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className={goldBtn}>
          {initial ? "Güncelle" : "Kaydet"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#e8e0d4] px-3 py-1.5 text-xs text-[#6b6158]"
          >
            İptal
          </button>
        ) : null}
      </div>
    </form>
  );
}
