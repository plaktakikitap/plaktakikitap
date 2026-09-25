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

export type AliskanlikProgramTuru =
  | "gunluk"
  | "belirli_gunler"
  | "iki_gunde_bir"
  | "haftada_x"
  | "ayda_x"
  | "esnek"
  | "haftalik"
  | "challenge";

export type AliskanlikZamanDilimi =
  | "sabah"
  | "gunduz"
  | "aksam"
  | "gun_boyu"
  | "yolculuk"
  | "ogle"
  | "gece";

export type AliskanlikKayitDurum =
  | "minimum"
  | "hedef"
  | "bonus"
  | "yapilmadi"
  | "planli_degil";

export type AliskanlikGunModu = "normal" | "yogun" | "toparlanma";

export type AliskanlikOzelTuru =
  | "namaz"
  | "ogun"
  | "dil"
  | "yolculuk"
  | "icerik_hatti"
  | "sosyal"
  | "uyku";

export type AliskanlikSorunTuru =
  | "zaman"
  | "ortam"
  | "tetikleyici"
  | "zorluk"
  | "enerji";

export interface AliskanlikAltAdim {
  kod: string;
  ad: string;
  grup?: string;
}

export type AliskanlikKayitEkstra = {
  sosyal_niyet?: "is" | "paylasim" | "mesaj" | "eglence" | "can_sikintisi";
  sosyal_alternatif?: string;
  yatis_saati?: string;
  uyanis_saati?: string;
  hedef_yatis?: string;
  hazirlik?: boolean;
  telefon_uzak?: boolean;
  ayaga_kalkma?: boolean;
  kendime_secim?: "kitap" | "sessizlik" | "yuruyus" | "sanat" | "dinlenme";
  spor_karsiladi?: boolean;
};

export interface Aliskanlik {
  id: string;
  ad: string;
  aciklama: string | null;
  aktif: boolean;
  kategori: string | null;
  kimlik_ifadesi: string | null;
  program_turu: AliskanlikProgramTuru | null;
  hedef_gunler: number[];
  hedef_siklik: number | null;
  birim: string | null;
  minimum_deger: number | null;
  hedef_deger: number | null;
  tetikleyici: string | null;
  zaman_dilimi: AliskanlikZamanDilimi | null;
  siradaki_adim: string | null;
  zorluk_seviyesi: number | null;
  sira: number;
  renk: string;
  ikon: string | null;
  ozel_tur: AliskanlikOzelTuru | null;
  arsivlendi: boolean;
  plan_kodu: string | null;
  asama: number | null;
  alt_adimlar: AliskanlikAltAdim[];
  karsilayan_aliskanlik_id: string | null;
  olusturma_tarihi: string;
  guncelleme_tarihi: string | null;
}

export interface AliskanlikKayit {
  id: string;
  aliskanlik_id: string;
  tarih: string;
  tamamlandi: boolean;
  durum: AliskanlikKayitDurum | null;
  deger: number | null;
  notlar: string | null;
  gun_modu: AliskanlikGunModu | null;
  kayit_zamani: string | null;
  alt_adimlar: Record<string, boolean>;
  ekstra: AliskanlikKayitEkstra;
}

export interface AliskanlikGunu {
  id: string;
  tarih: string;
  gun_modu: AliskanlikGunModu;
  notlar: string | null;
  olusturma_tarihi: string;
  guncelleme_tarihi: string | null;
}

export interface AliskanlikHaftalikDegerlendirme {
  id: string;
  hafta_baslangici: string;
  dogal_akan: string | null;
  zorlanan: string | null;
  sorun_turu: AliskanlikSorunTuru | null;
  buyuk_hedef: string | null;
  kucultme: string | null;
  ust_seviye: string | null;
  notlar: string | null;
  olusturma_tarihi: string;
  guncelleme_tarihi: string | null;
}
