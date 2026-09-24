import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import { createAdminClient } from "@/lib/supabase/admin";

const SELECT = `
  content_id,
  year, creator_or_director, genre_tags,
  poster_url, spine_url, review, rating_5, is_favorite,
  total_seasons, episodes_watched, avg_episode_min,
  seasons_watched, status, watch_status, watched_at,
  content_items!inner(id, title, slug, rating, visibility, created_at)
`;

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("series")
    .select(SELECT)
    .order("watched_at", { ascending: false, nullsFirst: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}
