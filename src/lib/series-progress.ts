export type SeriesProgressTone =
  | "completed"
  | "caught-up"
  | "behind"
  | "dropped"
  | "idle";

export type SeriesGridItem = {
  contentId: string;
  title: string;
  year: number | null;
  posterUrl: string | null;
  genres: string[];
  originCountry: string[];
  watchStatus: string | null;
  tmdbStatus: string | null;
  status: string | null;
  imdbRating: number | null;
  imdbPosition: number | null;
  totalSeasons: number | null;
  totalWatchedMinutes: number;
  lastWatchedAt: string | null;
  totalEpisodes: number;
  watchedEpisodes: number;
  airedEpisodes: number;
  watchedAired: number;
  progress: number;
  tone: SeriesProgressTone;
};

export type SeriesEpisodeItem = {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  name: string | null;
  overview: string | null;
  runtime: number | null;
  airDate: string | null;
  stillUrl: string | null;
  watched: boolean;
};

export type SeriesSeasonItem = {
  id: string;
  seasonNumber: number;
  name: string | null;
  episodeCount: number;
  airDate: string | null;
  posterUrl: string | null;
  overview: string | null;
  episodes: SeriesEpisodeItem[];
};

export type SeriesDetail = SeriesGridItem & {
  originalTitle: string | null;
  backdropUrl: string | null;
  overview: string | null;
  episodeRuntime: number | null;
  seasons: SeriesSeasonItem[];
};

export type AdminSeriesListItem = {
  contentId: string;
  title: string;
  year: number | null;
  posterUrl: string | null;
  watchStatus: string | null;
  imdbId: string | null;
  tmdbId: number | null;
  totalSeasons: number | null;
  imdbRating: number | null;
};

export function isSeriesEnded(tmdbStatus: string | null | undefined): boolean {
  const s = (tmdbStatus ?? "").toLowerCase();
  return s === "ended" || s === "canceled" || s === "cancelled";
}

export function seriesProgressTone(input: {
  watchStatus: string | null;
  status: string | null;
  tmdbStatus: string | null;
  totalEpisodes: number;
  watchedEpisodes: number;
  airedEpisodes: number;
  watchedAired: number;
}): SeriesProgressTone {
  if (input.watchStatus === "dropped" || input.status === "dropped") {
    return "dropped";
  }

  const ended = isSeriesEnded(input.tmdbStatus);
  const allMarked =
    input.totalEpisodes > 0 && input.watchedEpisodes >= input.totalEpisodes;
  if (ended && allMarked) return "completed";
  if (input.watchStatus === "completed" && allMarked) return "completed";

  const started =
    input.watchStatus === "watching" ||
    input.watchStatus === "rewatching" ||
    input.watchedEpisodes > 0;
  if (!started) return "idle";

  const caughtUp =
    input.airedEpisodes > 0 && input.watchedAired >= input.airedEpisodes;
  if (caughtUp && !ended) return "caught-up";
  return "behind";
}

export function seriesBarRatio(item: Pick<
  SeriesGridItem,
  "airedEpisodes" | "watchedAired" | "totalEpisodes" | "watchedEpisodes" | "progress"
>): number {
  if (item.airedEpisodes > 0) {
    return Math.min(1, item.watchedAired / item.airedEpisodes);
  }
  if (item.totalEpisodes > 0) {
    return Math.min(1, item.watchedEpisodes / item.totalEpisodes);
  }
  return Math.min(1, Math.max(0, item.progress || 0));
}

const GENRE_TR: Record<string, string> = {
  drama: "Dram",
  comedy: "Komedi",
  romance: "Romantik",
  thriller: "Gerilim",
  fantasy: "Fantastik",
  crime: "Suç",
  mystery: "Gizem",
  adventure: "Macera",
  action: "Aksiyon",
  "sci-fi": "Bilimkurgu",
  "sci fi": "Bilimkurgu",
  "science fiction": "Bilimkurgu",
  animation: "Animasyon",
  family: "Aile",
  history: "Tarih",
  horror: "Korku",
  musical: "Müzikal",
  biography: "Biyografi",
  short: "Kısa",
  music: "Müzik",
  war: "Savaş",
  "talk-show": "Sohbet programı",
  "talk show": "Sohbet programı",
  "reality-tv": "Reality şov",
  "reality tv": "Reality şov",
  documentary: "Belgesel",
  western: "Western",
  sport: "Spor",
  news: "Haber",
  "game-show": "Yarışma",
  "game show": "Yarışma",
};

export function translateGenre(genre: string): string {
  const key = genre.trim().toLowerCase().replace(/_/g, "-");
  const spaced = key.replace(/-/g, " ");
  return GENRE_TR[key] ?? GENRE_TR[spaced] ?? genre.trim();
}

export type SeriesOriginLabel =
  | "Türk"
  | "Amerikan"
  | "Kore"
  | "Japon"
  | "İngiliz"
  | "Diğer";

const ORIGIN_PRIORITY: { code: string; label: SeriesOriginLabel }[] = [
  { code: "TR", label: "Türk" },
  { code: "KR", label: "Kore" },
  { code: "JP", label: "Japon" },
  { code: "GB", label: "İngiliz" },
  { code: "US", label: "Amerikan" },
];

export function seriesOriginLabel(
  countries: string[] | null | undefined
): SeriesOriginLabel {
  const set = new Set((countries ?? []).map((c) => c.toUpperCase()));
  for (const row of ORIGIN_PRIORITY) {
    if (set.has(row.code)) return row.label;
  }
  return "Diğer";
}

export function seriesProgressColor(item: Pick<
  SeriesGridItem,
  "watchStatus" | "status" | "tone"
>): string {
  if (item.watchStatus === "dropped" || item.status === "dropped" || item.tone === "dropped") {
    return "#ef4444";
  }
  if (item.watchStatus === "completed" || item.tone === "completed") {
    return "#3b82f6";
  }
  if (
    item.watchStatus === "watching" ||
    item.watchStatus === "rewatching" ||
    item.tone === "caught-up" ||
    item.tone === "behind"
  ) {
    return "#22c55e";
  }
  return "#e5e7eb";
}

export function seriesBarIsFull(item: Pick<
  SeriesGridItem,
  "watchStatus" | "tone" | "progress"
>): boolean {
  if (item.watchStatus === "completed" || item.tone === "completed" || item.tone === "caught-up") {
    return true;
  }
  return (
    (item.watchStatus === "watching" || item.watchStatus === "rewatching") &&
    (item.progress || 0) >= 0.99
  );
}
