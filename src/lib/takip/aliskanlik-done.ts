import type { AliskanlikKayit, AliskanlikKayitDurum } from "@/types/takip";

export const DONE_DURUM: AliskanlikKayitDurum[] = [
  "minimum",
  "hedef",
  "bonus",
];

export function isAliskanlikKayitDone(kayit: AliskanlikKayit): boolean {
  if (kayit.durum === "planli_degil" || kayit.durum === "yapilmadi") {
    return false;
  }
  if (kayit.durum) return DONE_DURUM.includes(kayit.durum);
  return kayit.tamamlandi;
}

export function durumFromTamamlandi(
  tamamlandi: boolean
): AliskanlikKayitDurum {
  return tamamlandi ? "hedef" : "yapilmadi";
}
