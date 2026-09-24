import { createAdminClient } from "@/lib/supabase/admin";
import { AdminDizilerPanelV2, type SeriesRow } from "@/components/admin/AdminDizilerPanelV2";

export const dynamic = "force-dynamic";

function unwrapContent(raw: unknown): SeriesRow["content_items"] | null {
  if (!raw) return null;
  const item = Array.isArray(raw) ? raw[0] : raw;
  if (!item || typeof item !== "object") return null;
  return item as SeriesRow["content_items"];
}

async function getSeries(): Promise<SeriesRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("series")
    .select(
      `
      content_id,
      year, creator_or_director, genre_tags,
      poster_url, spine_url, review, rating_5, is_favorite,
      total_seasons, episodes_watched, avg_episode_min,
      seasons_watched, status, watch_status, watched_at,
      content_items!inner(id, title, slug, rating, visibility, created_at)
    `
    )
    .order("watched_at", { ascending: false, nullsFirst: false });

  if (error || !data) return [];

  return data
    .map((row) => {
      const content = unwrapContent(row.content_items);
      if (!content) return null;
      return {
        content_id: row.content_id as string,
        title: content.title,
        slug: content.slug ?? "",
        year: (row.year as number | null) ?? null,
        creator_or_director: (row.creator_or_director as string | null) ?? null,
        genre_tags: (row.genre_tags as string[] | null) ?? null,
        poster_url: (row.poster_url as string | null) ?? null,
        spine_url: (row.spine_url as string | null) ?? null,
        review: (row.review as string | null) ?? null,
        rating_5: (row.rating_5 as number | null) ?? null,
        is_favorite: Boolean(row.is_favorite),
        total_seasons: (row.total_seasons as number | null) ?? null,
        episodes_watched: (row.episodes_watched as number | null) ?? null,
        avg_episode_min: (row.avg_episode_min as number | null) ?? null,
        seasons_watched: (row.seasons_watched as number | null) ?? null,
        status: (row.status as string | null) ?? null,
        watch_status: (row.watch_status as string | null) ?? null,
        watched_at: (row.watched_at as string | null) ?? null,
        content_items: { ...content, slug: content.slug ?? "" },
      } satisfies SeriesRow;
    })
    .filter((row): row is SeriesRow => row != null);
}

export default async function DizilerPage() {
  const series = await getSeries();
  return <AdminDizilerPanelV2 initialSeries={series} />;
}
