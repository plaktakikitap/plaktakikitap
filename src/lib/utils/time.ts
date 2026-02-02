const MIN_PER_HOUR = 60;
const MIN_PER_DAY = 24 * MIN_PER_HOUR;
const MIN_PER_MONTH = 30 * MIN_PER_DAY; // 1 day = 24h, 1 month = 30 days

export interface Film {
  duration_min: number;
}

export interface Series {
  avg_episode_min: number | null;
  episodes_watched: number | null;
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

export interface TotalLifeSpent {
  totalMinutes: number;
  humanTR: string;
}

/**
 * Calculate total watch time from films and series.
 * Films: sum(duration_min). Series: sum((episodes_watched||0) * (avg_episode_min||0)).
 * Returns totalMinutes and humanTR "X Ay, Y Gün, Z Saat" (always all three units).
 */
export function calculateTotalLifeSpent(
  films: Film[],
  series: Series[]
): TotalLifeSpent {
  const filmMins = films.reduce((acc, f) => acc + (f.duration_min || 0), 0);
  const seriesMins = series.reduce(
    (acc, s) => acc + ((s.episodes_watched || 0) * (s.avg_episode_min || 0)),
    0
  );
  let totalMinutes = filmMins + seriesMins;

  const minutesInHour = 60;
  const minutesInDay = 24 * 60;
  const minutesInMonth = 30 * 24 * 60;

  const months = Math.floor(totalMinutes / minutesInMonth);
  totalMinutes %= minutesInMonth;

  const days = Math.floor(totalMinutes / minutesInDay);
  totalMinutes %= minutesInDay;

  const hours = Math.floor(totalMinutes / minutesInHour);

  return {
    totalMinutes: filmMins + seriesMins,
    humanTR: `${months} Ay, ${days} Gün, ${hours} Saat`,
  };
}
