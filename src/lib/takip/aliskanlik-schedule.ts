import {
  addDaysISO,
  daysBetweenISO,
  isoWeekday,
  startOfIsoWeekISO,
  startOfMonthISO,
} from "@/lib/date/istanbul";
import type { Aliskanlik, AliskanlikKayit } from "@/types/takip";
import { isAliskanlikKayitDone } from "@/lib/takip/aliskanlik-done";

export function effectiveProgram(
  habit: Aliskanlik
): NonNullable<Aliskanlik["program_turu"]> {
  if (habit.program_turu === "haftalik") return "haftada_x";
  if (habit.program_turu === "challenge") return "gunluk";
  return habit.program_turu ?? "gunluk";
}

function weekCompletions(
  habit: Aliskanlik,
  logs: AliskanlikKayit[],
  iso: string
): number {
  const start = startOfIsoWeekISO(iso);
  const end = addDaysISO(start, 6);
  let n = 0;
  for (const l of logs) {
    if (l.aliskanlik_id !== habit.id) continue;
    if (l.tarih < start || l.tarih > end) continue;
    if (isAliskanlikKayitDone(l)) n += 1;
  }
  return n;
}

function monthCompletions(
  habit: Aliskanlik,
  logs: AliskanlikKayit[],
  iso: string
): number {
  const start = startOfMonthISO(iso);
  const prefix = iso.slice(0, 7);
  let n = 0;
  for (const l of logs) {
    if (l.aliskanlik_id !== habit.id) continue;
    if (!l.tarih.startsWith(prefix) || l.tarih < start) continue;
    if (isAliskanlikKayitDone(l)) n += 1;
  }
  return n;
}

/** Bugün (veya verilen gün) bu alışkanlık için planlı mı? */
export function isPlannedOn(
  habit: Aliskanlik,
  iso: string,
  logs: AliskanlikKayit[] = []
): boolean {
  if (!habit.aktif || habit.arsivlendi) return false;
  const created = habit.olusturma_tarihi?.slice(0, 10);
  if (created && iso < created) return false;

  const explicitSkip = logs.find(
    (l) =>
      l.aliskanlik_id === habit.id &&
      l.tarih === iso &&
      l.durum === "planli_degil"
  );
  if (explicitSkip) return false;

  const program = effectiveProgram(habit);
  const wd = isoWeekday(iso);

  if (program === "gunluk") return true;
  if (program === "esnek") return false;

  if (program === "belirli_gunler") {
    return habit.hedef_gunler.includes(wd);
  }

  if (program === "iki_gunde_bir") {
    const origin = created || iso;
    const diff = daysBetweenISO(origin, iso);
    return diff >= 0 && diff % 2 === 0;
  }

  if (program === "haftada_x") {
    if (habit.hedef_gunler.length > 0) return habit.hedef_gunler.includes(wd);
    const hedef = habit.hedef_siklik ?? 1;
    return weekCompletions(habit, logs, iso) < hedef;
  }

  if (program === "ayda_x") {
    if (habit.hedef_gunler.length > 0) return habit.hedef_gunler.includes(wd);
    const hedef = habit.hedef_siklik ?? 1;
    return monthCompletions(habit, logs, iso) < hedef;
  }

  return true;
}

/** Esnek alışkanlıklar bugünün zorunlu listesinde değil; isteğe bağlı gösterilir. */
export function isOptionalToday(habit: Aliskanlik): boolean {
  return effectiveProgram(habit) === "esnek" && habit.aktif && !habit.arsivlendi;
}

export function previousPlannedDay(
  habit: Aliskanlik,
  beforeISO: string,
  logs: AliskanlikKayit[],
  maxLookback = 60
): string | null {
  for (let i = 1; i <= maxLookback; i++) {
    const iso = addDaysISO(beforeISO, -i);
    if (isPlannedOn(habit, iso, logs)) return iso;
  }
  return null;
}

export function missedLastPlanned(
  habit: Aliskanlik,
  todayISO: string,
  logs: AliskanlikKayit[]
): boolean {
  if (!isPlannedOn(habit, todayISO, logs)) return false;
  const prev = previousPlannedDay(habit, todayISO, logs);
  if (!prev) return false;
  const kayit = logs.find(
    (l) => l.aliskanlik_id === habit.id && l.tarih === prev
  );
  if (!kayit) return true;
  if (kayit.durum === "planli_degil") return false;
  return !isAliskanlikKayitDone(kayit);
}
