export type DilKodu = "ingilizce" | "fransizca" | "almanca" | "arapca";

export type DilZorluk = "kolay" | "orta" | "zor";

export type DilEtiket = "fiil" | "isim" | "sıfat" | "deyim" | "diğer";

export type DilNotKategori = "gramer" | "telaffuz" | "deyim" | "genel";

export interface DilKelime {
  id: string;
  dil: DilKodu;
  kelime: string;
  anlam: string;
  ornek_cumle: string | null;
  telaffuz: string | null;
  arapca_yazi: string | null;
  zorluk: DilZorluk;
  ogrenildi: boolean;
  tekrar_sayisi: number;
  son_tekrar: string | null;
  etiket: string[];
  olusturma_tarihi: string;
}

export interface DilNot {
  id: string;
  dil: DilKodu;
  baslik: string;
  icerik: string;
  kategori: DilNotKategori | null;
  olusturma_tarihi: string;
  guncelleme_tarihi: string;
}

export interface DilStats {
  kelime_sayisi: number;
  ogrenilen: number;
  not_sayisi: number;
}

export const DIL_META: Record<
  DilKodu,
  { label: string; bayrak: string; arapcaMod: boolean }
> = {
  ingilizce: { label: "İngilizce", bayrak: "🇬🇧", arapcaMod: false },
  fransizca: { label: "Fransızca", bayrak: "🇫🇷", arapcaMod: false },
  almanca: { label: "Almanca", bayrak: "🇩🇪", arapcaMod: false },
  arapca: { label: "Arapça", bayrak: "🇸🇦", arapcaMod: true },
};

export const DIL_LISTESI: DilKodu[] = [
  "ingilizce",
  "fransizca",
  "almanca",
  "arapca",
];
