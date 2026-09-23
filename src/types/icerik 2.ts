export type IcPlatform = "instagram" | "tiktok" | "youtube";
export type IcTur = "post" | "story" | "video" | "reel";
export type IcDurum = "fikir" | "yazildi" | "hazir" | "paylasildi";

export const IC_DURUMLAR: IcDurum[] = ["fikir", "yazildi", "hazir", "paylasildi"];

export const IC_DURUM_LABEL: Record<IcDurum, string> = {
  fikir: "Fikir",
  yazildi: "Yazıldı",
  hazir: "Hazır",
  paylasildi: "Paylaşıldı",
};

export const IC_TUR_LABEL: Record<IcTur, string> = {
  post: "Post",
  story: "Story",
  video: "Video",
  reel: "Reel",
};

export const IC_PLATFORM_LABEL: Record<IcPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};

export interface IcHesap {
  id: string;
  ad: string;
  renk: string;
  platformlar: IcPlatform[];
  aktif: boolean;
  sira: number;
  hedef_iki_gunde_bir: boolean;
}

export interface IcIcerik {
  id: string;
  hesap_id: string;
  tur: IcTur;
  platform: IcPlatform;
  baslik: string;
  aciklama: string | null;
  durum: IcDurum;
  planlanan_tarih: string | null;
  paylasim_tarihi: string | null;
  notlar: string | null;
  olusturma_tarihi: string;
  guncelleme_tarihi: string;
}

export interface IcIcerikWithHesap extends IcIcerik {
  hesap?: Pick<IcHesap, "id" | "ad" | "renk"> | null;
}

export interface IcHatirlatici {
  id: string;
  icerik_id: string;
  hatirlatma_zamani: string;
  gonderildi: boolean;
}

export interface IcHatirlaticiPending {
  id: string;
  hatirlatma_zamani: string;
  icerik_baslik: string;
  hesap_ad: string;
}
