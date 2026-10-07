"use server";

import { revalidatePath } from "next/cache";
import { isAdminApiAuthorized } from "@/lib/admin/requireAdminApi";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshSeriesFromTmdb as enrichSeriesFromTmdb } from "@/lib/series-tmdb-refresh";
import { slugify } from "@/lib/slug";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type WatchStatus =
  | "watchlist"
  | "watching"
  | "completed"
  | "dropped"
  | "rewatching"
  | "paused";

function revalidateDiziler() {
  revalidatePath("/diziler", "layout");
  revalidatePath("/secretgate/diziler");
  revalidatePath("/admin/diziler");
}

async function requireAdminWrite(options?: { allowDevBypass?: boolean }) {
  if (
    !(await isAdminApiAuthorized(undefined, {
      allowDevBypass: options?.allowDevBypass ?? false,
    }))
  ) {
    return { error: "Yetkisiz erişim" as const };
  }
  return null;
}

/** İzlenen bölüm sayısına göre watch_status: watchlist / watching / completed. */
async function syncSeriesWatchStatus(seriesId: string) {
  const supabase = createAdminClient();
  const [{ count: total }, { count: watched }, { data: series }] =
    await Promise.all([
      supabase
        .from("series_episodes")
        .select("*", { count: "exact", head: true })
        .eq("series_id", seriesId),
      supabase
        .from("series_episodes")
        .select("*", { count: "exact", head: true })
        .eq("series_id", seriesId)
        .eq("watched", true),
      supabase
        .from("series")
        .select("watch_status")
        .eq("content_id", seriesId)
        .maybeSingle(),
    ]);

  const current = (series as { watch_status?: string | null } | null)
    ?.watch_status;
  if (current === "dropped") return;

  let watch_status: WatchStatus = "watchlist";
  if ((watched ?? 0) <= 0) watch_status = "watchlist";
  else if (total && (watched ?? 0) >= total) watch_status = "completed";
  else watch_status = current === "rewatching" ? "rewatching" : "watching";

  if (watch_status === current) return;
  await supabase
    .from("series")
    .update({ watch_status })
    .eq("content_id", seriesId);
}

export async function toggleEpisode(episodeId: string, watched: boolean) {
  const denied = await requireAdminWrite();
  if (denied) return denied;
  if (!UUID_RE.test(episodeId)) return { error: "Geçersiz bölüm" };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("series_episodes")
    .update({
      watched,
      watched_at: watched ? new Date().toISOString() : null,
    })
    .eq("id", episodeId)
    .select("series_id")
    .maybeSingle();

  if (error) return { error: error.message };
  const seriesId = (data as { series_id?: string } | null)?.series_id;
  if (seriesId) await syncSeriesWatchStatus(seriesId);
  revalidateDiziler();
  return { ok: true as const };
}

export async function toggleSeason(
  seriesId: string,
  seasonNumber: number,
  watched: boolean
) {
  const denied = await requireAdminWrite();
  if (denied) return denied;
  if (!UUID_RE.test(seriesId)) return { error: "Geçersiz dizi" };
  if (!Number.isInteger(seasonNumber) || seasonNumber < 0) {
    return { error: "Geçersiz sezon" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("series_episodes")
    .update({
      watched,
      watched_at: watched ? new Date().toISOString() : null,
    })
    .eq("series_id", seriesId)
    .eq("season_number", seasonNumber);

  if (error) return { error: error.message };
  await syncSeriesWatchStatus(seriesId);
  revalidateDiziler();
  return { ok: true as const };
}

function writeError(message: string) {
  if (/row-level security/i.test(message)) {
    return "Kayıt yazılamadı. Sunucuda SUPABASE_SERVICE_ROLE_KEY tanımlı değil.";
  }
  return message;
}

async function markSeriesRewatching(seriesId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("series")
    .select("watch_status, status")
    .eq("content_id", seriesId)
    .maybeSingle();
  const row = data as { watch_status?: string | null; status?: string | null } | null;
  const dropped = row?.watch_status === "dropped" || row?.status === "dropped";
  await supabase
    .from("series")
    .update({
      watched_at: new Date().toISOString(),
      ...(dropped ? {} : { watch_status: "rewatching" }),
    })
    .eq("content_id", seriesId);
}

/** Dizinin kendi yorumu. */
export async function saveSeriesReview(seriesId: string, review: string) {
  const denied = await requireAdminWrite({ allowDevBypass: true });
  if (denied) return denied;
  if (!UUID_RE.test(seriesId)) return { error: "Geçersiz dizi" };
  const text = review.trim().slice(0, 8000);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("series")
    .update({ review: text || null })
    .eq("content_id", seriesId)
    .select("content_id");
  if (error) return { error: writeError(error.message) };
  if (!data?.length) {
    return {
      error:
        "Kayıt yazılamadı. Sunucuda SUPABASE_SERVICE_ROLE_KEY tanımlı değil.",
    };
  }
  revalidateDiziler();
  return { ok: true as const, review: text || null };
}

/** Tek bölüm yorumu. */
export async function saveEpisodeReview(episodeId: string, review: string) {
  const denied = await requireAdminWrite({ allowDevBypass: true });
  if (denied) return denied;
  if (!UUID_RE.test(episodeId)) return { error: "Geçersiz bölüm" };
  const text = review.trim().slice(0, 4000);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("series_episodes")
    .update({ review: text || null })
    .eq("id", episodeId)
    .select("id");
  if (error) return { error: writeError(error.message) };
  if (!data?.length) {
    return {
      error:
        "Kayıt yazılamadı. Sunucuda SUPABASE_SERVICE_ROLE_KEY tanımlı değil.",
    };
  }
  revalidateDiziler();
  return { ok: true as const, review: text || null };
}

async function bumpEpisodeRewatch(episodeIds: string[], seriesId: string) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("series_episodes")
    .select("id, watch_count")
    .in("id", episodeIds)
    .eq("series_id", seriesId);
  if (error) return { error: writeError(error.message) };
  const rows = (data ?? []) as { id: string; watch_count: number | null }[];
  if (rows.length === 0) return { error: "Bölüm bulunamadı" };

  const updated: { id: string; watchCount: number }[] = [];
  for (let i = 0; i < rows.length; i += 20) {
    const chunk = rows.slice(i, i + 20);
    const results = await Promise.all(
      chunk.map(async (row) => {
        const watchCount = (row.watch_count ?? 0) + 1;
        const { data: saved, error: updateError } = await supabase
          .from("series_episodes")
          .update({
            watched: true,
            watched_at: now,
            watch_count: watchCount,
          })
          .eq("id", row.id)
          .select("id");
        return {
          id: row.id,
          watchCount,
          error: updateError?.message
            ? updateError.message
            : saved?.length
              ? undefined
              : "row-level security",
        };
      })
    );
    const failed = results.find((result) => result.error);
    if (failed?.error) return { error: writeError(failed.error) };
    updated.push(
      ...results.map((result) => ({
        id: result.id,
        watchCount: result.watchCount,
      }))
    );
  }
  await markSeriesRewatching(seriesId);
  revalidateDiziler();
  return { ok: true as const, episodes: updated };
}

/** Seçilen bölümleri bir kez daha izlendi say. */
export async function rewatchEpisodes(seriesId: string, episodeIds: string[]) {
  const denied = await requireAdminWrite({ allowDevBypass: true });
  if (denied) return denied;
  if (!UUID_RE.test(seriesId)) return { error: "Geçersiz dizi" };
  const ids = [...new Set(episodeIds)].filter((id) => UUID_RE.test(id));
  if (ids.length === 0) return { error: "Bölüm seçilmedi" };
  if (ids.length > 80) return { error: "Bir seferde en fazla 80 bölüm" };
  return bumpEpisodeRewatch(ids, seriesId);
}

/** Sezonun yayınlanmış tüm bölümlerini tekrar izlendi say. */
export async function rewatchSeason(seriesId: string, seasonNumber: number) {
  const denied = await requireAdminWrite({ allowDevBypass: true });
  if (denied) return denied;
  if (!UUID_RE.test(seriesId)) return { error: "Geçersiz dizi" };
  if (!Number.isInteger(seasonNumber) || seasonNumber < 0) {
    return { error: "Geçersiz sezon" };
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("series_episodes")
    .select("id")
    .eq("series_id", seriesId)
    .eq("season_number", seasonNumber);
  if (error) return { error: writeError(error.message) };
  const ids = ((data ?? []) as { id: string }[]).map((row) => row.id);
  if (ids.length === 0) return { error: "Bu sezonda bölüm yok" };
  return bumpEpisodeRewatch(ids, seriesId);
}

export async function updateWatchStatus(
  seriesId: string,
  status: WatchStatus
) {
  const denied = await requireAdminWrite({ allowDevBypass: true });
  if (denied) return denied;
  if (!UUID_RE.test(seriesId)) return { error: "Geçersiz dizi" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("series")
    .update({ watch_status: status })
    .eq("content_id", seriesId);

  if (error) return { error: error.message };
  revalidateDiziler();
  return { ok: true as const };
}

export async function getAdminSeriesSeasons(seriesId: string) {
  const denied = await requireAdminWrite({ allowDevBypass: true });
  if (denied) return denied;
  if (!UUID_RE.test(seriesId)) return { error: "Geçersiz dizi" };

  const { loadAdminSeriesSeasons } = await import("@/lib/series-catalog");
  const seasons = await loadAdminSeriesSeasons(seriesId);
  return { seasons };
}

export async function refreshSeriesFromTmdb(seriesId: string) {
  const denied = await requireAdminWrite({ allowDevBypass: true });
  if (denied) return denied;
  if (!UUID_RE.test(seriesId)) return { error: "Geçersiz dizi" };

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey || apiKey === "YOUR_TMDB_API_KEY") {
    return { error: "TMDB_API_KEY tanımlı değil" };
  }

  const result = await enrichSeriesFromTmdb({
    supabase: createAdminClient(),
    apiKey,
    contentId: seriesId,
  });
  if ("error" in result) return result;
  revalidateDiziler();
  return { ok: true as const };
}

export type TmdbSeriesSearchItem = {
  id: number;
  name: string;
  original_name: string;
  first_air_date: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
};

const TMDB_GENRE_EN: Record<number, string> = {
  16: "Animation",
  18: "Drama",
  27: "Horror",
  35: "Comedy",
  37: "Western",
  53: "Thriller",
  80: "Crime",
  99: "Documentary",
  10751: "Family",
  10759: "Action",
  10762: "Kids",
  10763: "News",
  10764: "Reality-TV",
  10765: "Sci-Fi",
  10766: "Soap",
  10767: "Talk-Show",
  10768: "War",
};

export async function searchTmdbSeries(query: string): Promise<{
  results?: TmdbSeriesSearchItem[];
  error?: string;
}> {
  const denied = await requireAdminWrite({ allowDevBypass: true });
  if (denied) return denied;

  const q = query.trim();
  if (q.length < 2) return { results: [] };

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey || apiKey === "YOUR_TMDB_API_KEY") {
    return { error: "TMDB_API_KEY tanımlı değil" };
  }

  try {
    const url = new URL("https://api.themoviedb.org/3/search/tv");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("query", q);
    url.searchParams.set("language", "tr-TR");
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return { error: "TMDB arama hatası" };
    const data = (await res.json()) as { results?: TmdbSeriesSearchItem[] };
    return { results: (data.results ?? []).slice(0, 8) };
  } catch {
    return { error: "Arama başarısız" };
  }
}

export async function addSeriesFromTmdb(tmdbId: number): Promise<{
  success?: boolean;
  seriesId?: string;
  title?: string;
  error?: string;
}> {
  const denied = await requireAdminWrite({ allowDevBypass: true });
  if (denied) return denied;
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return { error: "Geçersiz TMDB id" };
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey || apiKey === "YOUR_TMDB_API_KEY") {
    return { error: "TMDB_API_KEY tanımlı değil" };
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("series")
    .select("content_id, content_items(title)")
    .eq("tmdb_id", tmdbId)
    .maybeSingle();

  if (existing) {
    const joined = (
      existing as {
        content_items:
          | { title?: string | null }
          | { title?: string | null }[]
          | null;
      }
    ).content_items;
    const title = Array.isArray(joined)
      ? joined[0]?.title
      : joined?.title;
    return { error: `Bu dizi zaten ekli${title ? `: ${title}` : ""}` };
  }

  const url = new URL(`https://api.themoviedb.org/3/tv/${tmdbId}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "tr-TR");
  url.searchParams.set("append_to_response", "external_ids");

  let tmdb: {
    name?: string;
    original_name?: string;
    first_air_date?: string | null;
    poster_path?: string | null;
    backdrop_path?: string | null;
    overview?: string | null;
    status?: string | null;
    number_of_seasons?: number | null;
    number_of_episodes?: number | null;
    origin_country?: string[] | null;
    genres?: { id: number; name: string }[] | null;
    external_ids?: { imdb_id?: string | null } | null;
  };
  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return { error: "TMDB'den bilgi alınamadı" };
    tmdb = await res.json();
  } catch {
    return { error: "TMDB'den bilgi alınamadı" };
  }

  const title = (tmdb.name || tmdb.original_name || "").trim();
  if (!title) return { error: "TMDB başlık döndürmedi" };

  const year = tmdb.first_air_date
    ? parseInt(tmdb.first_air_date.slice(0, 4), 10)
    : null;
  const genre_tags = (tmdb.genres ?? []).map(
    (g) => TMDB_GENRE_EN[g.id] ?? g.name
  );
  const slug = `${slugify(title) || "dizi"}-${tmdbId}`;

  const { data: content, error: contentError } = await supabase
    .from("content_items")
    .insert({
      type: "series",
      title,
      slug,
      description: tmdb.overview || null,
      visibility: "public",
    })
    .select("id")
    .single();

  if (contentError || !content) {
    return { error: contentError?.message ?? "İçerik eklenemedi" };
  }

  const { error: seriesError } = await supabase.from("series").insert({
    content_id: content.id,
    tmdb_id: tmdbId,
    imdb_id: tmdb.external_ids?.imdb_id || null,
    year: year != null && !Number.isNaN(year) ? year : null,
    poster_url: tmdb.poster_path
      ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`
      : null,
    backdrop_url: tmdb.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${tmdb.backdrop_path}`
      : null,
    overview: tmdb.overview || null,
    tmdb_status: tmdb.status || null,
    genre_tags: genre_tags.length ? genre_tags : null,
    origin_country: tmdb.origin_country?.length ? tmdb.origin_country : [],
    total_seasons: tmdb.number_of_seasons ?? 0,
    total_episodes: tmdb.number_of_episodes ?? 0,
    watch_status: "watchlist",
    episodes_watched: 0,
    seasons_watched: 0,
  });

  if (seriesError) {
    await supabase.from("content_items").delete().eq("id", content.id);
    return { error: seriesError.message };
  }

  try {
    await enrichSeriesFromTmdb({
      supabase,
      apiKey,
      contentId: content.id,
    });
  } catch (e) {
    console.error("Enrich hatası:", e);
  }

  revalidateDiziler();
  return { success: true, seriesId: content.id, title };
}
