export type Dil = "ingilizce" | "fransizca" | "almanca";
export type Seviye = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type KelimeTipi = "kelime" | "phrasal" | "kalip" | "kolokasyon";
export type OgrenmeDurumu = "yeni" | "ogreniyor" | "tekrar" | "ustalasildi";

export const DILLER: Dil[] = ["ingilizce", "fransizca", "almanca"];
export const SEVIYELER: Seviye[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function isDil(v: string): v is Dil {
  return DILLER.includes(v as Dil);
}

export function isSeviye(v: string): v is Seviye {
  return SEVIYELER.includes(v as Seviye);
}

export interface DilKelime {
  id: string;
  dil: Dil;
  seviye: Seviye;
  tip: KelimeTipi;
  hedef_dil: string;
  anlam_tr: string;
  ornek_cumle?: string;
  ornek_cumle_tr?: string;
  notlar?: string;
  created_at: string;
}

export interface OgrenmeKaydi {
  id: string;
  kelime_id: string;
  durum: OgrenmeDurumu;
  dogru_sayisi: number;
  yanlis_sayisi: number;
  son_gorulme?: string;
  sonraki_tekrar: string;
}

export interface KelimeVeKaydi extends DilKelime {
  kayit?: OgrenmeKaydi;
}

export interface SeviyeIlerleme {
  seviye: Seviye;
  toplam: number;
  yeni: number;
  ogreniyor: number;
  tekrar: number;
  ustalasildi: number;
  yuzde: number;
  acildi: boolean;
}

export interface DilIlerleme {
  dil: Dil;
  toplam_xp: number;
  bugun_xp: number;
  streak: number;
  seviyeler: SeviyeIlerleme[];
}

export interface QuizSorusu {
  kelime: DilKelime;
  kayit?: OgrenmeKaydi;
  yon: "tr_to_target" | "target_to_tr";
  secenekler: string[];
  dogru_cevap: string;
}

export interface YaziOdevi {
  id: string;
  dil: Dil;
  seviye: Seviye;
  prompt_tr: string;
  hedef_kelimeler: string[];
  tarih: string;
}

export interface XpKaydi {
  id: string;
  dil: Dil;
  etkinlik: string;
  xp: number;
  tarih: string;
}
