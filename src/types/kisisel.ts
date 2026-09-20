export type NotRenk = "sari" | "mavi" | "yesil" | "kirmizi" | "mor";

export interface Not {
  id: string;
  baslik: string;
  icerik: string | null;
  renk: NotRenk;
  etiket: string[];
  tarih: string | null;
  olusturma_tarihi: string;
  guncelleme_tarihi: string;
}

export type Oncelik = "acil" | "normal" | "bekleyebilir";

export interface Yapilacak {
  id: string;
  baslik: string;
  tamamlandi: boolean;
  oncelik: Oncelik;
  bitis_tarihi: string | null;
  kategori: string | null;
  olusturma_tarihi: string;
}

export interface KisiselDosya {
  id: string;
  dosya_adi: string;
  depolama_yolu: string;
  dosya_turu: string | null;
  boyut: number | null;
  klasor: string;
  olusturma_tarihi: string;
}
