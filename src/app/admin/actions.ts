"use server";

import {
  createPlannerDecor,
  deletePlannerDecor,
} from "@/lib/planner";
import {
  createFilm,
  createSeries,
  createBook,
  deleteContentItem,
  createPlannerEntry,
  updatePlannerEntry,
  deletePlannerEntry,
  addPlannerMedia,
  deletePlannerMedia,
  createArt,
  updateArt,
  deleteArt,
  addArtMedia,
  deleteArtMedia,
  createManualTrack,
  updateManualTrack,
  deleteManualTrack,
} from "@/lib/db/queries";

export async function adminCreateFilm(formData: FormData) {
  const title = formData.get("title") as string;
  if (!title?.trim()) return { error: "Title is required" };

  const year = formData.get("year")
    ? parseInt(formData.get("year") as string, 10)
    : null;
  const duration_min = parseInt(formData.get("duration_min") as string, 10);
  if (isNaN(duration_min) || duration_min < 1)
    return { error: "Duration is required" };

  const rating = formData.get("rating")
    ? parseFloat(formData.get("rating") as string)
    : null;
  const review = (formData.get("review") as string) || null;
  const visibility = (formData.get("visibility") as string) || "public";

  return createFilm({
    title: title.trim(),
    year,
    duration_min,
    rating,
    review: review?.trim() || null,
    poster_url: null,
    visibility:
      visibility === "unlisted"
        ? "unlisted"
        : visibility === "private"
          ? "private"
          : "public",
  });
}

export async function adminCreateSeries(formData: FormData) {
  const title = formData.get("title") as string;
  if (!title?.trim()) return { error: "Title is required" };

  const avg_episode_min = formData.get("avg_episode_min")
    ? parseInt(formData.get("avg_episode_min") as string, 10)
    : null;
  const episodes_watched = parseInt(
    formData.get("episodes_watched") as string,
    10
  ) || 0;
  const rating = formData.get("rating")
    ? parseFloat(formData.get("rating") as string)
    : null;
  const review = (formData.get("review") as string) || null;
  const visibility = (formData.get("visibility") as string) || "public";

  return createSeries({
    title: title.trim(),
    avg_episode_min,
    episodes_watched,
    seasons_watched: 0,
    rating,
    review: review?.trim() || null,
    visibility:
      visibility === "unlisted"
        ? "unlisted"
        : visibility === "private"
          ? "private"
          : "public",
  });
}

export async function adminCreateBook(formData: FormData) {
  const title = formData.get("title") as string;
  if (!title?.trim()) return { error: "Title is required" };

  const author = (formData.get("author") as string)?.trim() || null;
  const pages = formData.get("pages")
    ? parseInt(formData.get("pages") as string, 10)
    : null;
  const rating = formData.get("rating")
    ? parseFloat(formData.get("rating") as string)
    : null;
  const quote = (formData.get("quote") as string)?.trim() || null;
  const review = (formData.get("review") as string)?.trim() || null;
  const visibility = (formData.get("visibility") as string) || "public";

  return createBook({
    title: title.trim(),
    author,
    pages,
    rating,
    quote,
    review,
    cover_url: null,
    visibility:
      visibility === "unlisted"
        ? "unlisted"
        : visibility === "private"
          ? "private"
          : "public",
  });
}

export async function adminDeleteContent(id: string, type: "film" | "series" | "book") {
  return deleteContentItem(id, type);
}

// Planner
export async function adminCreatePlannerEntry(formData: FormData) {
  const date = formData.get("date") as string;
  if (!date?.trim()) return { error: "Date is required" };
  return createPlannerEntry({
    date: date.trim(),
    title: (formData.get("title") as string)?.trim() || null,
    body: (formData.get("body") as string)?.trim() || null,
    visibility: (formData.get("visibility") as "public" | "unlisted" | "private") || "private",
  });
}

export async function adminUpdatePlannerEntry(id: string, formData: FormData) {
  return updatePlannerEntry(id, {
    date: (formData.get("date") as string)?.trim(),
    title: (formData.get("title") as string)?.trim() || null,
    body: (formData.get("body") as string)?.trim() || null,
    visibility: (formData.get("visibility") as "public" | "unlisted" | "private") || undefined,
  });
}

export async function adminDeletePlannerEntry(id: string) {
  return deletePlannerEntry(id);
}

export async function adminAddPlannerMedia(formData: FormData) {
  const planner_entry_id = formData.get("planner_entry_id") as string;
  const url = formData.get("url") as string;
  if (!planner_entry_id || !url?.trim()) return { error: "Entry and URL required" };
  const kind = (formData.get("kind") as "image" | "video" | "link") || "link";
  return addPlannerMedia({
    planner_entry_id,
    kind,
    url: url.trim(),
    caption: (formData.get("caption") as string)?.trim() || null,
  });
}

export async function adminDeletePlannerMedia(id: string) {
  return deletePlannerMedia(id);
}

// Planner decor
export async function adminCreatePlannerDecor(formData: FormData) {
  const year = parseInt(formData.get("year") as string, 10);
  const month = parseInt(formData.get("month") as string, 10);
  const page = formData.get("page") as "left" | "right";
  const type = formData.get("type") as "sticker" | "tape" | "paperclip" | "pin";
  const x = parseFloat(formData.get("x") as string) || 0.5;
  const y = parseFloat(formData.get("y") as string) || 0.5;
  const rotation = parseFloat(formData.get("rotation") as string) || 0;
  const scale = parseFloat(formData.get("scale") as string) || 1;
  const assetUrl = (formData.get("asset_url") as string)?.trim() || null;

  if (!page || !type || isNaN(year) || isNaN(month)) {
    return { error: "Year, month, page, type gerekli" };
  }
  return createPlannerDecor({
    year,
    month,
    page,
    type,
    assetUrl,
    x,
    y,
    rotation,
    scale,
  });
}

export async function adminDeletePlannerDecor(id: string) {
  return deletePlannerDecor(id);
}

// Art
export async function adminCreateArt(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Title is required" };
  return createArt({
    title,
    slug: (formData.get("slug") as string)?.trim() || null,
    description: (formData.get("description") as string)?.trim() || null,
    visibility: (formData.get("visibility") as "public" | "unlisted" | "private") || "public",
  });
}

export async function adminUpdateArt(id: string, formData: FormData) {
  return updateArt(id, {
    title: (formData.get("title") as string)?.trim(),
    slug: (formData.get("slug") as string)?.trim() || null,
    description: (formData.get("description") as string)?.trim() || null,
    visibility: (formData.get("visibility") as "public" | "unlisted" | "private") || undefined,
  });
}

export async function adminDeleteArt(id: string) {
  return deleteArt(id);
}

export async function adminAddArtMedia(formData: FormData) {
  const content_id = formData.get("content_id") as string;
  const url = (formData.get("url") as string)?.trim();
  if (!content_id || !url) return { error: "Content and URL required" };
  return addArtMedia({
    content_id,
    kind: (formData.get("kind") as "image" | "video" | "link") || "link",
    url,
    caption: (formData.get("caption") as string)?.trim() || null,
  });
}

export async function adminDeleteArtMedia(id: string) {
  return deleteArtMedia(id);
}

// Manual Now Playing (Spotify fallback)
export async function adminCreateManualTrack(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const artist = (formData.get("artist") as string)?.trim();
  if (!title || !artist) return { error: "Başlık ve sanatçı gerekli" };
  return createManualTrack({
    title,
    artist,
    album_art_url: (formData.get("album_art_url") as string)?.trim() || null,
    track_url: (formData.get("track_url") as string)?.trim() || null,
    is_active: formData.get("is_active") === "on",
  });
}

export async function adminUpdateManualTrack(id: string, formData: FormData) {
  return updateManualTrack(id, {
    title: (formData.get("title") as string)?.trim(),
    artist: (formData.get("artist") as string)?.trim(),
    album_art_url: (formData.get("album_art_url") as string)?.trim() || null,
    track_url: (formData.get("track_url") as string)?.trim() || null,
    is_active: formData.get("is_active") === "on",
  });
}

export async function adminDeleteManualTrack(id: string) {
  return deleteManualTrack(id);
}

export async function adminSetActiveManualTrack(id: string) {
  return updateManualTrack(id, { is_active: true });
}

// Reading status (Şu an okuyorum)
export async function adminUpsertReadingStatus(formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const book_title = (formData.get("book_title") as string)?.trim();
  const author = (formData.get("author") as string)?.trim() || null;
  const cover_url = (formData.get("cover_url") as string)?.trim() || null;
  const note = (formData.get("note") as string)?.trim() || null;
  const status = (formData.get("status") as "reading" | "last") || "reading";

  if (!book_title) return { error: "Kitap adı gerekli" };

  const { data: existing } = await supabase
    .from("reading_status")
    .select("id")
    .limit(1)
    .maybeSingle();

  const row = {
    book_title,
    author,
    cover_url,
    note,
    status,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase
      .from("reading_status")
      .update(row)
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("reading_status").insert(row);
    if (error) return { error: error.message };
  }
  return { success: true };
}

// Site links (Footer)
export async function adminCreateSiteLink(formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const type = (formData.get("type") as string)?.trim() || "link";
  const label = (formData.get("label") as string)?.trim();
  const url = (formData.get("url") as string)?.trim();
  const sort_order = parseInt((formData.get("sort_order") as string) || "0", 10);
  const is_active = formData.get("is_active") === "on";

  if (!label || !url) return { error: "Etiket ve URL gerekli" };

  const { error } = await supabase.from("site_links").insert({
    type,
    label,
    url,
    sort_order,
    is_active,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function adminUpdateSiteLink(id: string, formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const type = (formData.get("type") as string)?.trim() || "link";
  const label = (formData.get("label") as string)?.trim();
  const url = (formData.get("url") as string)?.trim();
  const sort_order = parseInt((formData.get("sort_order") as string) || "0", 10);
  const is_active = formData.get("is_active") === "on";

  if (!label || !url) return { error: "Etiket ve URL gerekli" };

  const { error } = await supabase
    .from("site_links")
    .update({ type, label, url, sort_order, is_active })
    .eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function adminDeleteSiteLink(id: string) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const { error } = await supabase.from("site_links").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

// Social links (Footer — Bana ulaşın)
export async function adminCreateSocialLink(formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const platform = (formData.get("platform") as string)?.trim() || "link";
  const url = (formData.get("url") as string)?.trim();
  const icon_name = (formData.get("icon_name") as string)?.trim() || null;
  const order_index = parseInt((formData.get("order_index") as string) || "0", 10);
  const is_active = formData.get("is_active") === "on";

  if (!url) return { error: "URL gerekli" };

  const { error } = await supabase.from("social_links").insert({
    platform,
    url,
    icon_name,
    order_index,
    is_active,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function adminUpdateSocialLink(id: string, formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const platform = (formData.get("platform") as string)?.trim() || "link";
  const url = (formData.get("url") as string)?.trim();
  const icon_name = (formData.get("icon_name") as string)?.trim() || null;
  const order_index = parseInt((formData.get("order_index") as string) || "0", 10);
  const is_active = formData.get("is_active") === "on";

  if (!url) return { error: "URL gerekli" };

  const { error } = await supabase
    .from("social_links")
    .update({ platform, url, icon_name, order_index, is_active })
    .eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function adminDeleteSocialLink(id: string) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const { error } = await supabase.from("social_links").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function adminReorderSocialLinks(
  orderedIds: string[]
) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from("social_links")
      .update({ order_index: i })
      .eq("id", orderedIds[i]);
  }
  return { success: true };
}
