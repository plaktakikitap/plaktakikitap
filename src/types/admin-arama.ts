export type AdminAramaTur = "yazi" | "ceviri" | "kitap" | "not" | "kelime";

export type AdminAramaSonuc = {
  tur: AdminAramaTur;
  id: string;
  baslik: string;
  alt?: string;
  href: string;
};
