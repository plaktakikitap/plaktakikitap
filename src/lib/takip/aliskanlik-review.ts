import type { Aliskanlik, AliskanlikKayit } from "@/types/takip";
import { lastNRate } from "@/lib/takip/aliskanlik-stats";

export type HaftalikOneri = {
  aliskanlik_id: string;
  ad: string;
  metin: string;
};

export function haftalikOneriler(
  habits: Aliskanlik[],
  logs: AliskanlikKayit[],
  todayISO: string
): HaftalikOneri[] {
  const out: HaftalikOneri[] = [];
  for (const h of habits) {
    if (!h.aktif || h.arsivlendi) continue;
    const rate = lastNRate(h, logs, 7, todayISO);
    const ilgili = logs.filter((l) => l.aliskanlik_id === h.id);
    const minLogs = ilgili.filter((l) => l.durum === "minimum").length;
    const hedefLogs = ilgili.filter(
      (l) => l.durum === "hedef" || l.durum === "bonus"
    ).length;
    const missed = Math.max(0, rate.planlanan - rate.tamamlanan);

    if (rate.planlanan >= 2 && rate.oran < 0.4) {
      out.push({
        aliskanlik_id: h.id,
        ad: h.ad,
        metin: `${h.ad}: uygulama oranı düşük. Minimum hedefi küçültmeyi dene.`,
      });
      continue;
    }
    if (
      minLogs >= 3 &&
      hedefLogs <= 1 &&
      (h.hedef_deger ?? 0) > (h.minimum_deger ?? 0)
    ) {
      out.push({
        aliskanlik_id: h.id,
        ad: h.ad,
        metin: `${h.ad}: minimum sık yapılıyor, hedef nadiren. Hedefi yeniden ayarla.`,
      });
      continue;
    }
    if (missed >= 2) {
      out.push({
        aliskanlik_id: h.id,
        ad: h.ad,
        metin: `${h.ad}: iki veya daha fazla planlı gün kaçtı. Tetikleyiciyi veya zaman dilimini değiştir.`,
      });
      continue;
    }
    if (rate.planlanan >= 3 && rate.oran >= 0.8) {
      out.push({
        aliskanlik_id: h.id,
        ad: h.ad,
        metin: `${h.ad}: istikrarlı. Küçük bir adım büyütülebilir.`,
      });
    }
  }
  return out.slice(0, 8);
}
