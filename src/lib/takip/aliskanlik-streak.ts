import { addDaysISO } from "@/lib/date/istanbul";
import type { Aliskanlik, AliskanlikKayit } from "@/types/takip";
import { isAliskanlikKayitDone } from "@/lib/takip/aliskanlik-done";
import { isPlannedOn, previousPlannedDay } from "@/lib/takip/aliskanlik-schedule";

export { isAliskanlikKayitDone, durumFromTamamlandi } from "@/lib/takip/aliskanlik-done";

function logOnDay(
  logs: AliskanlikKayit[],
  habitId: string,
  iso: string
): AliskanlikKayit | undefined {
  return logs.find((l) => l.aliskanlik_id === habitId && l.tarih === iso);
}

/** Ardışık planlı ve tamamlanmış uygulama günü. Planlı olmayan günler atlanır. */
export function calcStreak(
  logs: AliskanlikKayit[],
  habit: Aliskanlik | string,
  todayISO: string
): number {
  const habitId = typeof habit === "string" ? habit : habit.id;
  const full = typeof habit === "string" ? null : habit;

  if (!full) {
    const done = new Set(
      logs
        .filter((l) => l.aliskanlik_id === habitId && isAliskanlikKayitDone(l))
        .map((l) => l.tarih)
    );
    let cursor = todayISO;
    if (!done.has(cursor)) cursor = addDaysISO(cursor, -1);
    let streak = 0;
    for (;;) {
      if (!done.has(cursor)) break;
      streak += 1;
      cursor = addDaysISO(cursor, -1);
    }
    return streak;
  }

  let cursor = todayISO;
  const todayLog = logOnDay(logs, habitId, todayISO);
  const todayDone = todayLog ? isAliskanlikKayitDone(todayLog) : false;
  if (!todayDone) {
    const prev = previousPlannedDay(full, todayISO, logs);
    if (!prev) return 0;
    cursor = prev;
  }

  let streak = 0;
  for (let i = 0; i < 400; i++) {
    if (!isPlannedOn(full, cursor, logs)) {
      const prev = previousPlannedDay(full, cursor, logs);
      if (!prev) break;
      cursor = prev;
      continue;
    }
    const kayit = logOnDay(logs, habitId, cursor);
    if (!kayit || !isAliskanlikKayitDone(kayit)) break;
    streak += 1;
    const prev = previousPlannedDay(full, cursor, logs);
    if (!prev) break;
    cursor = prev;
  }
  return streak;
}
