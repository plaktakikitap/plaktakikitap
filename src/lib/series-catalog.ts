import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import {
  seriesProgressTone,
  type AdminSeriesListItem,
  type SeriesDetail,
  type SeriesEpisodeItem,
  type SeriesGridItem,
  type SeriesSeasonItem,
} from "@/lib/series-progress";

export type { SeriesDetail, SeriesEpisodeItem, SeriesSeasonItem };

type EpisodeRow = {
  series_id: string;
  watched: boolean | null;
  air_date: string | null;
  watched_at: string | null;
};

type EpisodeDetailRow = {
  id: string;
  season_id: string | null;
  season_number: number;
  episode_number: number;
  name: string | null;
  overview: string | null;
  runtime: number | null;
  air_date: string | null;
  still_url: string | null;
  watched: boolean | null;
};

type SeasonRow = {
  id: string;
  season_number: number;
  name: string | null;
  episode_count: number | null;
  air_date: string | null;
  poster_url: string | null;
  overview: string | null;
};

function laterIso(
  a: string | null | undefined,
  b: string | null | undefined
): string | null {
  if (!a) return b ?? null;
  if (!b) return a;
  return a > b ? a : b;
}

type SeriesJoin = {
  content_id: string;
  year: number | null;
  poster_url: string | null;
  genre_tags: string[] | null;
  origin_country: string[] | null;
  watch_status: string | null;
  tmdb_status: string | null;
  status: string | null;
  imdb_id?: string | null;
  tmdb_id?: number | null;
  imdb_rating: number | null;
  imdb_position: number | null;
  total_seasons: number | null;
  total_episodes?: number | null;
  episode_runtime?: number | null;
  total_watched_minutes: number | null;
  watched_at?: string | null;
  backdrop_url?: string | null;
  overview?: string | null;
  content_items:
    | { id: string; title: string; visibility: string }
    | { id: string; title: string; visibility: string }[]
    | null;
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

async function loadEpisodeRows(
  supabase: Awaited<ReturnType<typeof createServerClient>>
): Promise<EpisodeRow[]> {
  const PAGE = 1000;
  const all: EpisodeRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("series_episodes")
      .select("series_id, watched, air_date, watched_at")
      .range(from, from + PAGE - 1);
    if (error) break;
    const batch = (data ?? []) as EpisodeRow[];
    all.push(...batch);
    if (batch.length < PAGE) break;
  }
  return all;
}

export async function getPublicSeriesGrid(): Promise<SeriesGridItem[]> {
  const supabase = await createServerClient();
  const [{ data, error }, episodes] = await Promise.all([
    supabase
      .from("series")
      .select(
        "content_id, year, poster_url, genre_tags, origin_country, watch_status, tmdb_status, status, imdb_rating, imdb_position, total_seasons, total_watched_minutes, watched_at, content_items!inner(id, title, visibility)"
      )
      .in("content_items.visibility", ["public", "unlisted"])
      .order("imdb_position", { ascending: true, nullsFirst: false }),
    loadEpisodeRows(supabase),
  ]);

  if (error || !data) return [];

  const today = todayIsoDate();
  const stats = new Map<
    string,
    {
      total: number;
      watched: number;
      aired: number;
      watchedAired: number;
      lastWatchedAt: string | null;
    }
  >();

  for (const ep of episodes) {
    const cur = stats.get(ep.series_id) ?? {
      total: 0,
      watched: 0,
      aired: 0,
      watchedAired: 0,
      lastWatchedAt: null as string | null,
    };
    cur.total += 1;
    const watched = Boolean(ep.watched);
    if (watched) {
      cur.watched += 1;
      cur.lastWatchedAt = laterIso(cur.lastWatchedAt, ep.watched_at);
    }
    const aired = !ep.air_date || ep.air_date <= today;
    if (aired) {
      cur.aired += 1;
      if (watched) cur.watchedAired += 1;
    }
    stats.set(ep.series_id, cur);
  }

  const items: SeriesGridItem[] = [];
  for (const row of data as SeriesJoin[]) {
    const content = Array.isArray(row.content_items)
      ? row.content_items[0]
      : row.content_items;
    if (!content?.title) continue;
    const st = stats.get(row.content_id) ?? {
      total: 0,
      watched: 0,
      aired: 0,
      watchedAired: 0,
      lastWatchedAt: null,
    };
    const tone = seriesProgressTone({
      watchStatus: row.watch_status,
      status: row.status,
      tmdbStatus: row.tmdb_status,
      totalEpisodes: st.total,
      watchedEpisodes: st.watched,
      airedEpisodes: st.aired,
      watchedAired: st.watchedAired,
    });
    items.push({
      contentId: row.content_id,
      title: content.title,
      year: row.year,
      posterUrl: row.poster_url,
      genres: row.genre_tags ?? [],
      originCountry: row.origin_country ?? [],
      watchStatus: row.watch_status,
      tmdbStatus: row.tmdb_status,
      status: row.status,
      imdbRating: row.imdb_rating != null ? Number(row.imdb_rating) : null,
      imdbPosition: row.imdb_position,
      totalSeasons: row.total_seasons,
      totalWatchedMinutes: row.total_watched_minutes ?? 0,
      lastWatchedAt: laterIso(st.lastWatchedAt, row.watched_at),
      totalEpisodes: st.total,
      watchedEpisodes: st.watched,
      airedEpisodes: st.aired,
      watchedAired: st.watchedAired,
      progress: st.total > 0 ? st.watched / st.total : 0,
      tone,
    });
  }

  return items;
}

export async function getPublicSeriesById(
  contentId: string
): Promise<SeriesGridItem | null> {
  const supabase = await createServerClient();
  const [{ data, error }, episodes] = await Promise.all([
    supabase
      .from("series")
      .select(
        "content_id, year, poster_url, genre_tags, origin_country, watch_status, tmdb_status, status, imdb_rating, imdb_position, total_seasons, total_watched_minutes, content_items!inner(id, title, visibility)"
      )
      .eq("content_id", contentId)
      .in("content_items.visibility", ["public", "unlisted"])
      .maybeSingle(),
    supabase
      .from("series_episodes")
      .select("series_id, watched, air_date")
      .eq("series_id", contentId),
  ]);

  if (error || !data) return null;
  const row = data as SeriesJoin;
  const content = Array.isArray(row.content_items)
    ? row.content_items[0]
    : row.content_items;
  if (!content?.title) return null;

  const today = todayIsoDate();
  let total = 0;
  let watched = 0;
  let aired = 0;
  let watchedAired = 0;
  for (const ep of (episodes.data ?? []) as EpisodeRow[]) {
    total += 1;
    const isWatched = Boolean(ep.watched);
    if (isWatched) watched += 1;
    const isAired = !ep.air_date || ep.air_date <= today;
    if (isAired) {
      aired += 1;
      if (isWatched) watchedAired += 1;
    }
  }

  return {
    contentId: row.content_id,
    title: content.title,
    year: row.year,
    posterUrl: row.poster_url,
    genres: row.genre_tags ?? [],
    originCountry: row.origin_country ?? [],
    watchStatus: row.watch_status,
    tmdbStatus: row.tmdb_status,
    status: row.status,
    imdbRating: row.imdb_rating != null ? Number(row.imdb_rating) : null,
    imdbPosition: row.imdb_position,
    totalSeasons: row.total_seasons,
    totalWatchedMinutes: row.total_watched_minutes ?? 0,
    lastWatchedAt: row.watched_at ?? null,
    totalEpisodes: total,
    watchedEpisodes: watched,
    airedEpisodes: aired,
    watchedAired,
    progress: total > 0 ? watched / total : 0,
    tone: seriesProgressTone({
      watchStatus: row.watch_status,
      status: row.status,
      tmdbStatus: row.tmdb_status,
      totalEpisodes: total,
      watchedEpisodes: watched,
      airedEpisodes: aired,
      watchedAired,
    }),
  };
}

type QueryClient =
  | Awaited<ReturnType<typeof createServerClient>>
  | ReturnType<typeof createAdminClient>;

async function loadEpisodesForSeries(
  supabase: QueryClient,
  seriesId: string
): Promise<EpisodeDetailRow[]> {
  const PAGE = 1000;
  const all: EpisodeDetailRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("series_episodes")
      .select(
        "id, season_id, season_number, episode_number, name, overview, runtime, air_date, still_url, watched"
      )
      .eq("series_id", seriesId)
      .order("season_number", { ascending: true })
      .order("episode_number", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) break;
    const batch = (data ?? []) as EpisodeDetailRow[];
    all.push(...batch);
    if (batch.length < PAGE) break;
  }
  return all;
}

function toEpisodeItem(ep: EpisodeDetailRow): SeriesEpisodeItem {
  return {
    id: ep.id,
    seasonNumber: ep.season_number,
    episodeNumber: ep.episode_number,
    name: ep.name,
    overview: ep.overview,
    runtime: ep.runtime,
    airDate: ep.air_date,
    stillUrl: ep.still_url,
    watched: Boolean(ep.watched),
  };
}

export async function getPublicSeriesDetail(
  contentId: string
): Promise<SeriesDetail | null> {
  const supabase = await createServerClient();
  const [{ data, error }, seasonRes, episodes] = await Promise.all([
    supabase
      .from("series")
      .select(
        "content_id, year, poster_url, backdrop_url, overview, genre_tags, origin_country, watch_status, tmdb_status, status, imdb_id, imdb_rating, imdb_position, total_seasons, total_episodes, episode_runtime, total_watched_minutes, content_items!inner(id, title, visibility)"
      )
      .eq("content_id", contentId)
      .in("content_items.visibility", ["public", "unlisted"])
      .maybeSingle(),
    supabase
      .from("series_seasons")
      .select("id, season_number, name, episode_count, air_date, poster_url, overview")
      .eq("series_id", contentId)
      .order("season_number", { ascending: true }),
    loadEpisodesForSeries(supabase, contentId),
  ]);

  if (error || !data) return null;
  const row = data as SeriesJoin;
  const content = Array.isArray(row.content_items)
    ? row.content_items[0]
    : row.content_items;
  if (!content?.title) return null;

  let originalTitle: string | null = null;
  if (row.imdb_id) {
    const { data: watch } = await supabase
      .from("imdb_watchlist")
      .select("original_title")
      .eq("imdb_id", row.imdb_id)
      .maybeSingle();
    originalTitle = (watch as { original_title?: string | null } | null)
      ?.original_title ?? null;
  }

  const today = todayIsoDate();
  let total = 0;
  let watched = 0;
  let aired = 0;
  let watchedAired = 0;
  const bySeason = new Map<number, SeriesEpisodeItem[]>();
  for (const ep of episodes) {
    total += 1;
    const isWatched = Boolean(ep.watched);
    if (isWatched) watched += 1;
    const isAired = !ep.air_date || ep.air_date <= today;
    if (isAired) {
      aired += 1;
      if (isWatched) watchedAired += 1;
    }
    const list = bySeason.get(ep.season_number) ?? [];
    list.push(toEpisodeItem(ep));
    bySeason.set(ep.season_number, list);
  }

  const seasons: SeriesSeasonItem[] = ((seasonRes.data ?? []) as SeasonRow[]).map(
    (s) => ({
      id: s.id,
      seasonNumber: s.season_number,
      name: s.name,
      episodeCount: s.episode_count ?? bySeason.get(s.season_number)?.length ?? 0,
      airDate: s.air_date,
      posterUrl: s.poster_url,
      overview: s.overview,
      episodes: bySeason.get(s.season_number) ?? [],
    })
  );

  if (seasons.length === 0 && bySeason.size > 0) {
    for (const [num, eps] of [...bySeason.entries()].sort((a, b) => a[0] - b[0])) {
      seasons.push({
        id: `${contentId}-${num}`,
        seasonNumber: num,
        name: `Sezon ${num}`,
        episodeCount: eps.length,
        airDate: null,
        posterUrl: null,
        overview: null,
        episodes: eps,
      });
    }
  }

  return {
    contentId: row.content_id,
    title: content.title,
    originalTitle,
    year: row.year,
    posterUrl: row.poster_url,
    backdropUrl: row.backdrop_url ?? null,
    overview: row.overview ?? null,
    genres: row.genre_tags ?? [],
    originCountry: row.origin_country ?? [],
    watchStatus: row.watch_status,
    tmdbStatus: row.tmdb_status,
    status: row.status,
    imdbRating: row.imdb_rating != null ? Number(row.imdb_rating) : null,
    imdbPosition: row.imdb_position,
    totalSeasons: row.total_seasons,
    episodeRuntime:
      row.episode_runtime ??
      episodes.find((e) => e.runtime != null)?.runtime ??
      null,
    totalWatchedMinutes: row.total_watched_minutes ?? 0,
    lastWatchedAt: row.watched_at ?? null,
    totalEpisodes: total,
    watchedEpisodes: watched,
    airedEpisodes: aired,
    watchedAired,
    progress: total > 0 ? watched / total : 0,
    tone: seriesProgressTone({
      watchStatus: row.watch_status,
      status: row.status,
      tmdbStatus: row.tmdb_status,
      totalEpisodes: total,
      watchedEpisodes: watched,
      airedEpisodes: aired,
      watchedAired,
    }),
    seasons,
  };
}

function groupSeasons(
  contentId: string,
  seasonRows: SeasonRow[],
  episodes: EpisodeDetailRow[]
): SeriesSeasonItem[] {
  const bySeason = new Map<number, SeriesEpisodeItem[]>();
  for (const ep of episodes) {
    const list = bySeason.get(ep.season_number) ?? [];
    list.push(toEpisodeItem(ep));
    bySeason.set(ep.season_number, list);
  }

  const seasons: SeriesSeasonItem[] = seasonRows.map((s) => ({
    id: s.id,
    seasonNumber: s.season_number,
    name: s.name,
    episodeCount: s.episode_count ?? bySeason.get(s.season_number)?.length ?? 0,
    airDate: s.air_date,
    posterUrl: s.poster_url,
    overview: s.overview,
    episodes: bySeason.get(s.season_number) ?? [],
  }));

  if (seasons.length === 0 && bySeason.size > 0) {
    for (const [num, eps] of [...bySeason.entries()].sort((a, b) => a[0] - b[0])) {
      seasons.push({
        id: `${contentId}-${num}`,
        seasonNumber: num,
        name: `Sezon ${num}`,
        episodeCount: eps.length,
        airDate: null,
        posterUrl: null,
        overview: null,
        episodes: eps,
      });
    }
  }

  return seasons;
}

export async function getAdminSeriesList(): Promise<AdminSeriesListItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("series")
    .select(
      "content_id, year, poster_url, watch_status, imdb_id, tmdb_id, total_seasons, imdb_rating, imdb_position, content_items!inner(id, title)"
    );

  if (error || !data) return [];

  return (data as SeriesJoin[])
    .map((row) => {
      const content = Array.isArray(row.content_items)
        ? row.content_items[0]
        : row.content_items;
      if (!content?.title) return null;
      return {
        contentId: row.content_id,
        title: content.title,
        year: row.year,
        posterUrl: row.poster_url,
        watchStatus: row.watch_status,
        imdbId: row.imdb_id ?? null,
        tmdbId: (row as { tmdb_id?: number | null }).tmdb_id ?? null,
        totalSeasons: row.total_seasons,
        imdbRating: row.imdb_rating != null ? Number(row.imdb_rating) : null,
      } satisfies AdminSeriesListItem;
    })
    .filter((row): row is AdminSeriesListItem => row != null)
    .sort((a, b) => a.title.localeCompare(b.title, "tr"));
}

export async function loadAdminSeriesSeasons(
  seriesId: string
): Promise<SeriesSeasonItem[]> {
  const supabase = createAdminClient();
  const [seasonRes, episodes] = await Promise.all([
    supabase
      .from("series_seasons")
      .select("id, season_number, name, episode_count, air_date, poster_url, overview")
      .eq("series_id", seriesId)
      .order("season_number", { ascending: true }),
    loadEpisodesForSeries(supabase, seriesId),
  ]);

  return groupSeasons(
    seriesId,
    (seasonRes.data ?? []) as SeasonRow[],
    episodes
  );
}
