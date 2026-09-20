import * as XLSX from "xlsx";

export interface ExportColumn {
  key: string;
  baslik: string;
}

interface ExportOptions {
  data: Record<string, unknown>[];
  dosyaAdi: string;
  sutunlar: ExportColumn[];
  sheetName?: string;
}

function rowsFromData(
  data: Record<string, unknown>[],
  sutunlar: ExportColumn[]
): Record<string, unknown>[] {
  return data.map((satir) => {
    const yeniSatir: Record<string, unknown> = {};
    for (const { key, baslik } of sutunlar) {
      const val = satir[key];
      if (Array.isArray(val)) {
        yeniSatir[baslik] = val.join(", ");
      } else if (val == null) {
        yeniSatir[baslik] = "";
      } else {
        yeniSatir[baslik] = val;
      }
    }
    return yeniSatir;
  });
}

function sheetFromRows(
  satirlar: Record<string, unknown>[],
  sutunlar: ExportColumn[]
) {
  const ws = XLSX.utils.json_to_sheet(satirlar);
  ws["!cols"] = sutunlar.map(({ baslik }) => ({
    wch: Math.min(
      60,
      Math.max(
        baslik.length + 2,
        ...satirlar.map((s) => String(s[baslik] ?? "").length)
      )
    ),
  }));
  return ws;
}

/** Tarayıcıda .xlsx indir. */
export function exportToExcel({
  data,
  dosyaAdi,
  sutunlar,
  sheetName = "Veriler",
}: ExportOptions) {
  const satirlar = rowsFromData(data, sutunlar);
  const ws = sheetFromRows(satirlar, sutunlar);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${dosyaAdi}.xlsx`);
}

export function exportAllToExcel(sheets: {
  name: string;
  data: Record<string, unknown>[];
  sutunlar: ExportColumn[];
}[]) {
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const satirlar = rowsFromData(sheet.data, sheet.sutunlar);
    const ws = sheetFromRows(satirlar, sheet.sutunlar);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
  }
  const stamp = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `plaktakikitap-tum-veriler-${stamp}.xlsx`);
}

export const KITAP_SUTUNLARI: ExportColumn[] = [
  { key: "title", baslik: "Kitap Adı" },
  { key: "author", baslik: "Yazar" },
  { key: "page_count", baslik: "Sayfa" },
  { key: "status", baslik: "Durum" },
  { key: "rating", baslik: "Puan" },
  { key: "tags", baslik: "Etiketler" },
  { key: "review", baslik: "Yorum" },
  { key: "quote", baslik: "Alıntı" },
  { key: "start_date", baslik: "Başlangıç" },
  { key: "end_date", baslik: "Bitiş" },
  { key: "visibility", baslik: "Görünürlük" },
  { key: "created_at", baslik: "Eklenme Tarihi" },
];

export const FILM_SUTUNLARI: ExportColumn[] = [
  { key: "title", baslik: "Film Adı" },
  { key: "year", baslik: "Yapım Yılı" },
  { key: "director", baslik: "Yönetmen" },
  { key: "genre", baslik: "Tür" },
  { key: "rating", baslik: "Puan" },
  { key: "duration_min", baslik: "Süre (dk)" },
  { key: "review", baslik: "Yorum" },
  { key: "watched_at", baslik: "İzleme Tarihi" },
  { key: "rewatch_count", baslik: "Tekrar İzleme" },
  { key: "visibility", baslik: "Görünürlük" },
  { key: "created_at", baslik: "Eklenme Tarihi" },
];

export const DIZI_SUTUNLARI: ExportColumn[] = [
  { key: "title", baslik: "Dizi Adı" },
  { key: "year", baslik: "Yıl" },
  { key: "creator_or_director", baslik: "Yaratıcı / Yönetmen" },
  { key: "seasons", baslik: "Sezon (toplam)" },
  { key: "seasons_watched", baslik: "İzlenen Sezon" },
  { key: "episodes_watched", baslik: "İzlenen Bölüm" },
  { key: "genre", baslik: "Tür" },
  { key: "rating", baslik: "Puan" },
  { key: "status", baslik: "Durum" },
  { key: "review", baslik: "Yorum" },
  { key: "watched_at", baslik: "İzleme Tarihi" },
  { key: "visibility", baslik: "Görünürlük" },
  { key: "created_at", baslik: "Eklenme Tarihi" },
];
