/** Takvim günü her zaman Europe/Istanbul. UTC `toISOString()` kullanma. */

export const ISTANBUL_TZ = "Europe/Istanbul";

const istanbulDateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: ISTANBUL_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const GUN_ADLARI = [
  "pazartesi",
  "salı",
  "çarşamba",
  "perşembe",
  "cuma",
  "cumartesi",
  "pazar",
] as const;

/** Bugünün YYYY-MM-DD değeri (İstanbul). */
export function istanbulTodayISO(now = new Date()): string {
  return istanbulDateFmt.format(now);
}

/** YYYY-MM (İstanbul). */
export function istanbulMonthISO(now = new Date()): string {
  return istanbulTodayISO(now).slice(0, 7);
}

/** Tarih-only ISO üzerinde gün ekle/çıkar (takvim aritmetiği, UTC kayması yok). */
export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** `end` dahil geriye n takvim günü (İstanbul). */
export function lastNDaysISO(n: number, end = istanbulTodayISO()): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(addDaysISO(end, -i));
  }
  return days;
}

/** ISO weekday: 1=Pazartesi … 7=Pazar. */
export function isoWeekday(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const utcDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return utcDay === 0 ? 7 : utcDay;
}

export function isoWeekdayName(iso: string): (typeof GUN_ADLARI)[number] {
  return GUN_ADLARI[isoWeekday(iso) - 1];
}

export function formatIstanbulLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function startOfIsoWeekISO(iso: string): string {
  return addDaysISO(iso, -(isoWeekday(iso) - 1));
}

export function startOfMonthISO(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function daysBetweenISO(from: string, to: string): number {
  const [y1, m1, d1] = from.split("-").map(Number);
  const [y2, m2, d2] = to.split("-").map(Number);
  const a = Date.UTC(y1, m1 - 1, d1);
  const b = Date.UTC(y2, m2 - 1, d2);
  return Math.round((b - a) / 86_400_000);
}

export function compareISO(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}
