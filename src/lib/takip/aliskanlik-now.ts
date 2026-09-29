import type {
  Aliskanlik,
  AliskanlikBaglam,
  AliskanlikCevreAlaniKodu,
  AliskanlikGunModu,
  AliskanlikGunu,
  AliskanlikKayit,
} from "@/types/takip";
import { isAliskanlikKayitDone } from "@/lib/takip/aliskanlik-done";
import { zamanSlot, type ZamanSlot } from "@/lib/takip/aliskanlik-progress";
import { isPlannedOn, missedLastPlanned } from "@/lib/takip/aliskanlik-schedule";

export const BAGLAM_SECENEK: { id: AliskanlikBaglam; ad: string }[] = [
  { id: "ev", ad: "Evdeyim" },
  { id: "is", ad: "İşteyim" },
  { id: "yol", ad: "Yoldayım" },
  { id: "dusuk_enerji", ad: "Enerjim düşük" },
];

export const CEVRE_ALANLARI: { id: AliskanlikCevreAlaniKodu; ad: string }[] = [
  { id: "yatak_odasi", ad: "Yatak odası" },
  { id: "calisma_masasi", ad: "Çalışma masası" },
  { id: "mutfak", ad: "Mutfak" },
  { id: "canta", ad: "Çanta" },
  { id: "telefon", ad: "Telefon" },
  { id: "yolculuk", ad: "Yolculuk" },
];

export const AKSAM_ADIM_VARSAYILAN = [
  { kod: "kiyafet", ad: "Yarının kıyafetini hazırla" },
  { kod: "canta", ad: "Çantayı hazırla" },
  { kod: "ogun_su", ad: "Ara öğünü veya suyu hazırla" },
  { kod: "kuran", ad: "Kur’an’ı görünür yere koy" },
  { kod: "telefon", ad: "Telefonu yatağın dışındaki şarj yerine bırak" },
  { kod: "ilk_davranis", ad: "Yarının ilk önemli davranışını seç" },
];

export const DURTU_ALTERNATIFLER = [
  "3 dakika piyano",
  "2 sayfa kitap",
  "5 kelime tekrar",
  "kısa yürüyüş",
  "tek cümlelik içerik fikri",
  "hiçbir şey yapmadan kısa süre dinlenme",
] as const;

export function isAksamSaati(hour: number): boolean {
  return hour >= 17;
}

export function saatSlot(hour: number): ZamanSlot {
  if (hour >= 5 && hour < 11) return "sabah";
  if (hour >= 18 || hour < 5) return "aksam";
  return "gunduz";
}

export function matchesBaglam(
  habit: Aliskanlik,
  baglam: AliskanlikBaglam | null
): boolean {
  if (!baglam) return true;
  if (!habit.baglamlar.length) return true;
  return habit.baglamlar.includes(baglam);
}

export function baglamSirasi(
  habit: Aliskanlik,
  baglam: AliskanlikBaglam | null
): number {
  if (!baglam) return 1;
  if (!habit.baglamlar.length) return 1;
  return habit.baglamlar.includes(baglam) ? 0 : 2;
}

export function isGecikmis(
  habit: Aliskanlik,
  hour: number,
  kayit: AliskanlikKayit | undefined
): boolean {
  if (kayit && isAliskanlikKayitDone(kayit)) return false;
  const slot = zamanSlot(habit.zaman_dilimi);
  if (slot === "sabah") return hour >= 11;
  if (slot === "gunduz") return hour >= 18;
  if (slot === "yolculuk") return hour >= 20;
  if (slot === "gun_boyu") return hour >= 21;
  return false;
}

export function oneriMetni(habit: Aliskanlik, minOneCikar: boolean): string {
  const min = habit.minimum_deger;
  const birim = habit.birim ? ` ${habit.birim}` : "";
  if (minOneCikar && min != null) {
    return `${habit.ad} — ${min}${birim}`;
  }
  if (habit.o_zaman_davranis) return habit.o_zaman_davranis;
  if (habit.tetikleyici) return `${habit.ad} · ${habit.tetikleyici}`;
  return habit.ad;
}

export function pickNowSuggestion(input: {
  habits: Aliskanlik[];
  logs: AliskanlikKayit[];
  today: string;
  hour: number;
  gun: AliskanlikGunu | null;
}): Aliskanlik | null {
  const baglam = input.gun?.baglam ?? null;
  const skip = new Set([
    ...(input.gun?.atlanan_oneriler ?? []),
    ...(input.gun?.uygun_degil ?? []),
  ]);
  const slot = saatSlot(input.hour);
  const minOneCikar =
    input.gun?.gun_modu !== "normal" || baglam === "dusuk_enerji";

  let best: Aliskanlik | null = null;
  let bestScore = -1;

  for (const h of input.habits) {
    if (!h.aktif || h.arsivlendi) continue;
    if (skip.has(h.id)) continue;
    if (!isPlannedOn(h, input.today, input.logs)) continue;
    const kayit = input.logs.find(
      (l) => l.aliskanlik_id === h.id && l.tarih === input.today
    );
    if (kayit && isAliskanlikKayitDone(kayit)) continue;

    let score = 10;
    if (missedLastPlanned(h, input.today, input.logs)) score += 100;
    const hSlot = zamanSlot(h.zaman_dilimi);
    if (hSlot === slot) score += 40;
    else if (hSlot === "gun_boyu") score += 16;
    if (baglam === "yol" && hSlot === "yolculuk") score += 35;
    if (matchesBaglam(h, baglam)) score += 25;
    else score -= 8;
    if (minOneCikar && h.minimum_deger != null) score += 12;
    if (isGecikmis(h, input.hour, kayit)) score += 20;
    score -= h.sira;

    if (score > bestScore) {
      bestScore = score;
      best = h;
    }
  }

  return best;
}

export function minOncelik(
  gunModu: AliskanlikGunModu,
  baglam: AliskanlikBaglam | null,
  missed: boolean
): boolean {
  return gunModu !== "normal" || baglam === "dusuk_enerji" || missed;
}

const SEBEP_AD: Record<string, string> = {
  is: "iş",
  paylasim: "paylaşım",
  mesaj: "mesaj",
  merak: "merak",
  can_sikintisi: "can sıkıntısı",
};

export function durtuIstatistik(rows: {
  sebep: string;
  saat: number;
  durum: string;
}[]): {
  enSikSebep: string | null;
  enSikSaat: string | null;
  gecti: number;
  alternatif: number;
  toplam: number;
} {
  const biten = rows.filter((r) => r.durum !== "bekliyor");
  const gecti = biten.filter((r) => r.durum === "istek_gecti").length;
  const alternatif = biten.filter((r) => r.durum === "alternatif_yapildi").length;
  const sebepSay = new Map<string, number>();
  const saatSay = new Map<number, number>();
  for (const r of biten) {
    sebepSay.set(r.sebep, (sebepSay.get(r.sebep) ?? 0) + 1);
    const bucket = Math.floor(r.saat / 3) * 3;
    saatSay.set(bucket, (saatSay.get(bucket) ?? 0) + 1);
  }
  let enSikSebep: string | null = null;
  let maxS = 0;
  for (const [k, n] of sebepSay) {
    if (n > maxS) {
      maxS = n;
      enSikSebep = SEBEP_AD[k] ?? k;
    }
  }
  let enSikSaat: string | null = null;
  let maxH = 0;
  for (const [start, n] of saatSay) {
    if (n > maxH) {
      maxH = n;
      const end = start + 2;
      enSikSaat = `${String(start).padStart(2, "0")}–${String(end).padStart(2, "0")}`;
    }
  }
  return {
    enSikSebep,
    enSikSaat,
    gecti,
    alternatif,
    toplam: biten.length,
  };
}
