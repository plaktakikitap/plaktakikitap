export type BeslenmeOgun = "sabah" | "ogle" | "aksam" | "ara_ogun";

export interface BeslenmeAiAnaliz {
  tahmini_kalori?: number;
  protein_g?: number;
  karbonhidrat_g?: number;
  yag_g?: number;
  deger_lendirme?: string;
  eksik_besin?: string[];
}

export interface BeslenmeKayit {
  id: string;
  tarih: string;
  ogun: BeslenmeOgun;
  yenen: string;
  ai_analiz: BeslenmeAiAnaliz | null;
  olusturma_tarihi: string;
}

export interface SporKayit {
  id: string;
  tarih: string;
  aktivite: string;
  sure_dakika: number | null;
  mesafe_km: number | null;
  enerji_seviyesi: number | null;
  notlar: string | null;
  olusturma_tarihi: string;
}

export type RuhHali = "iyi" | "orta" | "zor";

export interface GunlukKayit {
  id: string;
  tarih: string;
  icerik: string;
  ruh_hali: RuhHali | null;
  olusturma_tarihi: string;
  guncelleme_tarihi: string;
}

export interface SukurKayit {
  id: string;
  tarih: string;
  madde_1: string;
  madde_2: string;
  madde_3: string;
  olusturma_tarihi: string;
}

export type FinansTur = "gelir" | "gider";

export interface FinansKategori {
  id: string;
  ad: string;
  tur: FinansTur;
  renk: string;
}

export interface FinansKayit {
  id: string;
  tarih: string;
  tur: FinansTur;
  tutar: number;
  kategori: string;
  notlar: string | null;
  olusturma_tarihi: string;
}

export interface Aliskanlik {
  id: string;
  ad: string;
  aciklama: string | null;
  aktif: boolean;
  olusturma_tarihi: string;
}

export interface AliskanlikKayit {
  id: string;
  aliskanlik_id: string;
  tarih: string;
  tamamlandi: boolean;
}
