import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import {
  mapSeriesStatusInput,
  parseAdminVisibility,
  syncWatchStatusForVisibility,
} from "@/lib/series-status-map";
import { createAdminClient } from "@/lib/supabase/admin";

function finiteOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function isoOrNull(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const d = new Date(raw.trim());
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function revalidateSeries() {
  revalidatePath("/");
  revalidatePath("/cinema");
  revalidatePath("/diziler");
  revalidatePath("/izleme-gunlugum");
  revalidatePath("/izleme-gunlugum/diziler");
  revalidatePath("/secretgate");
  revalidatePath("/secretgate/diziler");
  revalidatePath("/secretgate/series");
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id: contentId } = await params;
  if (!contentId) {
    return NextResponse.json({ error: "Geçersiz id" }, { status: 400 });
  }

  const supabase = createAdminClient();
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const {
    title,
    slug,
    visibility,
    creator_or_director,
    year,
    genre_tags,
    poster_url,
    spine_url,
    rating_5,
    watched_at,
    review,
    is_favorite,
    status,
    total_seasons,
    episodes_watched,
    avg_episode_min,
    seasons_watched,
  } = body;

  const ciUpdate: Record<string, unknown> = {};
  if (title !== undefined) ciUpdate.title = title;
  if (slug !== undefined) ciUpdate.slug = slug;
  const vis = parseAdminVisibility(visibility);
  if (visibility !== undefined) {
    if (!vis) {
      return NextResponse.json({ error: "Geçersiz görünürlük" }, { status: 400 });
    }
    ciUpdate.visibility = vis;
  }
  if (rating_5 !== undefined) {
    const r5 = finiteOrNull(rating_5);
    ciUpdate.rating = r5 != null ? r5 * 2 : null;
  }

  if (Object.keys(ciUpdate).length) {
    let { error } = await supabase
      .from("content_items")
      .update(ciUpdate)
      .eq("id", contentId)
      .eq("type", "series");
    if (
      error &&
      vis === "archived" &&
      /visibility|check constraint/i.test(error.message)
    ) {
      ciUpdate.visibility = "private";
      ({ error } = await supabase
        .from("content_items")
        .update(ciUpdate)
        .eq("id", contentId)
        .eq("type", "series"));
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sUpdate: Record<string, unknown> = {};
  if (creator_or_director !== undefined) {
    sUpdate.creator_or_director = creator_or_director || null;
  }
  if (year !== undefined) {
    sUpdate.year = finiteOrNull(year);
  }
  if (genre_tags !== undefined) {
    sUpdate.genre_tags = Array.isArray(genre_tags)
      ? genre_tags
      : typeof genre_tags === "string"
        ? genre_tags.split(/[\s,]+/).map((t) => t.trim()).filter(Boolean)
        : null;
  }
  if (poster_url !== undefined) sUpdate.poster_url = poster_url || null;
  if (spine_url !== undefined) sUpdate.spine_url = spine_url || null;
  if (rating_5 !== undefined) {
    const r5 = finiteOrNull(rating_5);
    sUpdate.rating_5 = r5 != null && r5 > 0 ? r5 : null;
  }
  if (watched_at !== undefined) {
    sUpdate.watched_at = isoOrNull(watched_at);
  }
  if (review !== undefined) sUpdate.review = review || null;
  if (is_favorite !== undefined) {
    const fav = is_favorite === true || is_favorite === "true" || is_favorite === "on";
    sUpdate.is_favorite = fav;
    sUpdate.favorite_order = fav ? Date.now() : null;
  }
  if (status !== undefined || vis) {
    const statusRaw =
      typeof status === "string"
        ? status
        : null;
    const synced = syncWatchStatusForVisibility(
      vis ?? "",
      statusRaw ?? ""
    );
    const mapped = mapSeriesStatusInput(synced || statusRaw);
    if (mapped.watch_status != null || mapped.status != null || status !== undefined) {
      sUpdate.status = mapped.status;
      sUpdate.watch_status = mapped.watch_status;
    }
  }
  if (total_seasons !== undefined) {
    sUpdate.total_seasons = finiteOrNull(total_seasons);
  }
  if (episodes_watched !== undefined) {
    const n = finiteOrNull(episodes_watched);
    sUpdate.episodes_watched = n == null ? 0 : n;
  }
  if (avg_episode_min !== undefined) {
    sUpdate.avg_episode_min = finiteOrNull(avg_episode_min);
  }
  if (seasons_watched !== undefined) {
    const n = finiteOrNull(seasons_watched);
    sUpdate.seasons_watched = n == null ? 0 : n;
  }

  const ep =
    sUpdate.episodes_watched != null
      ? Number(sUpdate.episodes_watched)
      : undefined;
  const avg =
    sUpdate.avg_episode_min != null ? Number(sUpdate.avg_episode_min) : undefined;
  if (ep != null && avg != null && ep > 0 && avg > 0) {
    sUpdate.total_duration_min = ep * avg;
  }

  if (Object.keys(sUpdate).length) {
    let { error } = await supabase
      .from("series")
      .update(sUpdate)
      .eq("content_id", contentId);
    if (
      error &&
      /watch_status/i.test(error.message) &&
      (sUpdate.watch_status === "paused" ||
        sUpdate.watch_status === "rewatching")
    ) {
      sUpdate.watch_status = "watching";
      ({ error } = await supabase
        .from("series")
        .update(sUpdate)
        .eq("content_id", contentId));
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateSeries();
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Geçersiz id" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("content_items")
    .delete()
    .eq("id", id)
    .eq("type", "series");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateSeries();
  return NextResponse.json({ ok: true });
}
