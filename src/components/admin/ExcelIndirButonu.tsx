"use client";

import { useState } from "react";
import type { ExportColumn } from "@/lib/export-excel";

export function ExcelIndirButonu({
  tur,
  sutunlar,
}: {
  tur: "kitaplar" | "filmler" | "diziler";
  sutunlar?: ExportColumn[];
}) {
  const [yukleniyor, setYukleniyor] = useState(false);

  const indir = async () => {
    setYukleniyor(true);
    try {
      const {
        DIZI_SUTUNLARI,
        exportToExcel,
        FILM_SUTUNLARI,
        KITAP_SUTUNLARI,
      } = await import("@/lib/export-excel");
      const defaultCols =
        tur === "kitaplar"
          ? KITAP_SUTUNLARI
          : tur === "filmler"
            ? FILM_SUTUNLARI
            : DIZI_SUTUNLARI;
      const cols = sutunlar ?? defaultCols;
      const res = await fetch(`/api/admin/export/${tur}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "İndirme başarısız");
      const data = (json.data ?? []) as Record<string, unknown>[];
      const stamp = new Date().toISOString().split("T")[0];
      exportToExcel({
        data,
        dosyaAdi: `plaktakikitap-${tur}-${stamp}`,
        sutunlar: cols,
        sheetName:
          tur === "kitaplar" ? "Kitaplar" : tur === "filmler" ? "Filmler" : "Diziler",
      });
    } catch (err) {
      console.error("İndirme hatası:", err);
      alert("İndirme sırasında bir sorun oluştu");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <button
      type="button"
      onClick={indir}
      disabled={yukleniyor}
      className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(201,166,90,0.3)] bg-[rgba(201,166,90,0.1)] px-4 py-2 text-[0.85rem] text-[#c9a65a] transition hover:bg-[rgba(201,166,90,0.2)] disabled:cursor-wait disabled:opacity-60"
    >
      {yukleniyor ? "Hazırlanıyor..." : "Excel İndir"}
    </button>
  );
}

export function ExcelTumunuIndirButonu() {
  const [yukleniyor, setYukleniyor] = useState(false);

  const indir = async () => {
    setYukleniyor(true);
    try {
      const {
        DIZI_SUTUNLARI,
        exportAllToExcel,
        FILM_SUTUNLARI,
        KITAP_SUTUNLARI,
      } = await import("@/lib/export-excel");
      const res = await fetch("/api/admin/export/all");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "İndirme başarısız");
      exportAllToExcel([
        {
          name: "Kitaplar",
          data: json.kitaplar ?? [],
          sutunlar: KITAP_SUTUNLARI,
        },
        {
          name: "Filmler",
          data: json.filmler ?? [],
          sutunlar: FILM_SUTUNLARI,
        },
        {
          name: "Diziler",
          data: json.diziler ?? [],
          sutunlar: DIZI_SUTUNLARI,
        },
      ]);
    } catch (err) {
      console.error("İndirme hatası:", err);
      alert("İndirme sırasında bir sorun oluştu");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <button
      type="button"
      onClick={indir}
      disabled={yukleniyor}
      className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(201,166,90,0.3)] bg-[rgba(201,166,90,0.1)] px-4 py-2 text-[0.85rem] text-[#c9a65a] transition hover:bg-[rgba(201,166,90,0.2)] disabled:cursor-wait disabled:opacity-60"
    >
      {yukleniyor ? "Hazırlanıyor..." : "Tümünü İndir"}
    </button>
  );
}
