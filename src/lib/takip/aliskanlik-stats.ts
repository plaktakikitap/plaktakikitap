import { addDaysISO, lastNDaysISO } from "@/lib/date/istanbul";
import type { Aliskanlik, AliskanlikKayit } from "@/types/takip";
import { isAliskanlikKayitDone } from "@/lib/takip/aliskanlik-done";
import { isPlannedOn } from "@/lib/takip/aliskanlik-schedule";

export type PeriodOran = {
  planlanan: number;
  tamamlanan: number;
  oran: number;
};

function periodRate(
  habit: Aliskanlik,
  logs: AliskanlikKayit[],
  days: string[]
): PeriodOran {
  let planlanan = 0;
  let tamamlanan = 0;
  for (const iso of days) {
    if (!isPlannedOn(habit, iso, logs)) continue;
    planlanan += 1;
    const kayit = logs.find(
      (l) => l.aliskanlik_id === habit.id && l.tarih === iso
    );
    if (kayit && isAliskanlikKayitDone(kayit)) tamamlanan += 1;
  }
  return {
    planlanan,
    tamamlanan,
    oran: planlanan === 0 ? 0 : tamamlanan / planlanan,
  };
}

export function lastNRate(
  habit: Aliskanlik,
  logs: AliskanlikKayit[],
  n: number,
  todayISO: string
): PeriodOran {
  return periodRate(habit, logs, lastNDaysISO(n, todayISO));
}

export function durumCounts(
  habit: Aliskanlik,
  logs: AliskanlikKayit[]
): { minimum: number; hedef: number; bonus: number; toparlanma: number } {
  let minimum = 0;
  let hedef = 0;
  let bonus = 0;
  let toparlanma = 0;
  for (const l of logs) {
    if (l.aliskanlik_id !== habit.id) continue;
    if (l.durum === "minimum") minimum += 1;
    else if (l.durum === "hedef") hedef += 1;
    else if (l.durum === "bonus") bonus += 1;
    if (l.gun_modu === "toparlanma" && isAliskanlikKayitDone(l)) {
      toparlanma += 1;
    }
  }
  return { minimum, hedef, bonus, toparlanma };
}

export function lastDoneISO(
  habit: Aliskanlik,
  logs: AliskanlikKayit[]
): string | null {
  let latest: string | null = null;
  for (const l of logs) {
    if (l.aliskanlik_id !== habit.id) continue;
    if (!isAliskanlikKayitDone(l)) continue;
    if (!latest || l.tarih > latest) latest = l.tarih;
  }
  return latest;
}

export function kategoriDengesi(
  habits: Aliskanlik[],
  logs: AliskanlikKayit[],
  todayISO: string
): { kategori: string; planlanan: number; tamamlanan: number }[] {
  const days = lastNDaysISO(7, todayISO);
  const map = new Map<string, { planlanan: number; tamamlanan: number }>();
  for (const h of habits) {
    if (!h.aktif || h.arsivlendi) continue;
    const kat = h.kategori?.trim() || "Diğer";
    const cur = map.get(kat) ?? { planlanan: 0, tamamlanan: 0 };
    const rate = periodRate(h, logs, days);
    cur.planlanan += rate.planlanan;
    cur.tamamlanan += rate.tamamlanan;
    map.set(kat, cur);
  }
  return [...map.entries()].map(([kategori, v]) => ({ kategori, ...v }));
}

export function heatmapRatio(
  habits: Aliskanlik[],
  logs: AliskanlikKayit[],
  iso: string
): { planned: number; done: number; ratio: number } {
  let planned = 0;
  let done = 0;
  for (const h of habits) {
    if (!h.aktif || h.arsivlendi) continue;
    if (!isPlannedOn(h, iso, logs)) continue;
    planned += 1;
    const kayit = logs.find(
      (l) => l.aliskanlik_id === h.id && l.tarih === iso
    );
    if (kayit && isAliskanlikKayitDone(kayit)) done += 1;
  }
  return {
    planned,
    done,
    ratio: planned === 0 ? 0 : done / planned,
  };
}

export function last90Heatmap(
  habits: Aliskanlik[],
  logs: AliskanlikKayit[],
  todayISO: string
): { iso: string; ratio: number; planned: number; done: number }[] {
  const days: { iso: string; ratio: number; planned: number; done: number }[] =
    [];
  for (let i = 89; i >= 0; i--) {
    const iso = addDaysISO(todayISO, -i);
    days.push({ iso, ...heatmapRatio(habits, logs, iso) });
  }
  return days;
}
