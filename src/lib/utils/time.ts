const MIN_PER_HOUR = 60;
const MIN_PER_DAY = 24 * MIN_PER_HOUR;
const MIN_PER_MONTH = 30 * MIN_PER_DAY; // 1 day = 24h, 1 month = 30 days

export interface Film {
  duration_min: number;
  rewatch_count?: number | null;
}

export interface Series {
  total_duration_min?: number | null;
  avg_episode_min: number | null;
  episodes_watched: number | null;
  rewatch_count?: number | null;
}

/** Film: süre × (1 + tekrar izleme). Diziler bu fonksiyona girmez. */
export function filmWatchMinutes(film: {
  duration_min?: number | null;
  rewatch_count?: number | null;
}): number {
  const duration = film.duration_min ?? 0;
  if (duration <= 0) return 0;
  return duration * (1 + (film.rewatch_count ?? 0));
}

/**
 * Dizi: izlenen bölüm × ortalama süre (veya kayıtlı total_duration_min)
 * × (1 + tekrar). Film süreleri bu fonksiyona girmez.
 */
export function seriesWatchMinutes(series: {
  total_duration_min?: number | null;
  avg_episode_min?: number | null;
  episodes_watched?: number | null;
  rewatch_count?: number | null;
}): number {
  const fromEpisodes =
    (series.episodes_watched ?? 0) * (series.avg_episode_min ?? 0);
  const stored = series.total_duration_min;
  const base =
    stored != null && Number.isFinite(stored) && stored > 0 ? stored : fromEpisodes;
  if (base <= 0) return 0;
  return base * (1 + (series.rewatch_count ?? 0));
}

/**
 * Format total minutes as "X months, Y days, Z hours".
 * Uses 30-day month approximation.
 */
export function minutesToHuman(mins: number): string {
  if (mins < 0) return "0 hours";
  if (mins < MIN_PER_HOUR) return "< 1 hour";

  const months = Math.floor(mins / MIN_PER_MONTH);
  let rem = mins % MIN_PER_MONTH;
  const days = Math.floor(rem / MIN_PER_DAY);
  rem = rem % MIN_PER_DAY;
  const hours = Math.floor(rem / MIN_PER_HOUR);

  const parts: string[] = [];
  if (months > 0) parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  if (days > 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);

  return parts.join(", ") || "0 hours";
}

/**
 * Format total minutes as "X Ay, Y Gün, Z Saat" (Turkish, comma-separated).
 * Uses 1 Day = 24 Hours, 1 Month = 30 Days.
 */
export function minutesToTurkish(mins: number): string {
  if (mins < 0) return "0 Saat";
  if (mins < MIN_PER_HOUR) return "< 1 Saat";

  const ay = Math.floor(mins / MIN_PER_MONTH);
  let rem = mins % MIN_PER_MONTH;
  const gun = Math.floor(rem / MIN_PER_DAY);
  rem = rem % MIN_PER_DAY;
  const saat = Math.floor(rem / MIN_PER_HOUR);

  const parts: string[] = [];
  if (ay > 0) parts.push(`${ay} Ay`);
  if (gun > 0) parts.push(`${gun} Gün`);
  if (saat > 0) parts.push(`${saat} Saat`);

  return parts.join(", ") || "0 Saat";
}

const MIN_PER_YEAR = 365 * 24 * MIN_PER_HOUR; // 1 yıl ≈ 365 gün

/**
 * Format total minutes as "X Yıl, Y Ay, Z Gün, W Saat" (Turkish).
 * Film izlemek için harcadığı süre. Uses 1 Ay = 30 Gün, 1 Yıl = 365 Gün.
 */
export function formatWatchTimeYilAyGunSaat(totalMinutes: number): string {
  if (totalMinutes < 0) return "0 Saat";
  if (totalMinutes < MIN_PER_HOUR) return "0 Saat";

  let rem = totalMinutes;
  const yil = Math.floor(rem / MIN_PER_YEAR);
  rem %= MIN_PER_YEAR;
  const ay = Math.floor(rem / MIN_PER_MONTH);
  rem %= MIN_PER_MONTH;
  const gun = Math.floor(rem / MIN_PER_DAY);
  rem %= MIN_PER_DAY;
  const saat = Math.floor(rem / MIN_PER_HOUR);

  const parts: string[] = [];
  if (yil > 0) parts.push(`${yil} Yıl`);
  if (ay > 0) parts.push(`${ay} Ay`);
  if (gun > 0) parts.push(`${gun} Gün`);
  if (saat > 0) parts.push(`${saat} Saat`);

  return parts.join(", ") || "0 Saat";
}

export interface TotalLifeSpent {
  totalMinutes: number;
  humanTR: string;
}

/**
 * Film süreleri ve dizi süreleri ayrı toplanır, sonra toplanır (hub).
 * Film formülü: duration_min × (1 + rewatch).
 * Dizi formülü: izlenen bölüm × ortalama süre × (1 + rewatch).
 */
export function calculateTotalLifeSpent(
  films: Film[],
  series: Series[]
): TotalLifeSpent {
  const filmMins = films.reduce((acc, f) => acc + filmWatchMinutes(f), 0);
  const seriesMins = series.reduce((acc, s) => acc + seriesWatchMinutes(s), 0);
  const combined = filmMins + seriesMins;

  let rem = combined;
  const minutesInHour = 60;
  const minutesInDay = 24 * 60;
  const minutesInMonth = 30 * 24 * 60;

  const months = Math.floor(rem / minutesInMonth);
  rem %= minutesInMonth;

  const days = Math.floor(rem / minutesInDay);
  rem %= minutesInDay;

  const hours = Math.floor(rem / minutesInHour);

  return {
    totalMinutes: combined,
    humanTR: `${months} Ay, ${days} Gün, ${hours} Saat`,
  };
}
