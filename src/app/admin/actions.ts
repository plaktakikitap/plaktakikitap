"use server";

import { revalidatePath } from "next/cache";
import {
  createPlannerDecorAdmin,
  deletePlannerDecorAdmin,
} from "@/lib/planner-admin";
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
    spine_url: null,
    director: null,
    genre_tags: [],
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
  const pagesRaw = formData.get("pages");
  const pages = pagesRaw ? parseInt(pagesRaw as string, 10) : null;
  if (pages == null || isNaN(pages) || pages < 1)
    return { error: "Sayfa sayısı gerekli" };
  const rating = formData.get("rating")
    ? parseFloat(formData.get("rating") as string)
    : null;
  const quote = (formData.get("quote") as string)?.trim() || null;
  const review = (formData.get("review") as string)?.trim() || null;
  const visibility = (formData.get("visibility") as string) || "public";

  return createBook({
    title: title.trim(),
    author: author ?? "",
    pages,
    rating,
    quote,
    review,
    cover_url: null,
    spine_url: "",
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
  return createPlannerDecorAdmin({
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
  return deletePlannerDecorAdmin(id);
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
  const progressRaw = (formData.get("progress_percent") as string)?.trim();
  const progress_percent =
    progressRaw !== "" && progressRaw != null
      ? Math.max(0, Math.min(100, parseInt(progressRaw, 10) || 0))
      : null;

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
    progress_percent: Number.isNaN(progress_percent as number) ? null : progress_percent,
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

export async function adminUpsertReadingGoal(formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const year = parseInt((formData.get("year") as string) || "0", 10) || new Date().getFullYear();
  const goal = Math.max(0, parseInt((formData.get("goal") as string) || "12", 10));
  const key = `reading_goal_${year}`;
  const value_json = { year, goal };

  const { error } = await supabase
    .from("settings")
    .upsert({ key, value_json }, { onConflict: "key" });
  if (error) return { error: error.message };
  return { success: true };
}

/** Translations page intro (settings key: translation_intro) */
export async function adminUpsertTranslationIntro(formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const text = (formData.get("translation_intro") as string)?.trim() ?? "";
  const key = "translation_intro";
  const value_json = { text };

  const { error } = await supabase
    .from("settings")
    .upsert({ key, value_json }, { onConflict: "key" });
  if (error) return { error: error.message };
  revalidatePath("/translations");
  return { success: true };
}

/** Plaktaki Kitap kanal tanıtımı (settings key: youtube_intro) */
export async function adminUpsertYoutubeIntro(formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const text = (formData.get("youtube_intro") as string)?.trim() ?? "";
  const channel_url = (formData.get("youtube_channel_url") as string)?.trim() || null;
  const channel_id = (formData.get("youtube_channel_id") as string)?.trim() || null;
  const spotify_url = (formData.get("spotify_url") as string)?.trim() || null;
  const value_json = { text, channel_url, channel_id, spotify_url };

  const { error } = await supabase
    .from("settings")
    .upsert({ key: "youtube_intro", value_json }, { onConflict: "key" });
  if (error) return { error: error.message };
  revalidatePath("/plaktaki-kitap");
  return { success: true };
}

/** Academia bölümü (settings key: translation_academia) */
export async function adminUpsertTranslationAcademia(formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const raw = formData.get("translation_academia_json") as string | null;
  let value_json: { profile_url: string; projects: { title: string; url: string }[] } = {
    profile_url: "",
    projects: [],
  };
  if (raw?.trim()) {
    try {
      const parsed = JSON.parse(raw) as { profile_url?: string; projects?: { title: string; url: string }[] };
      value_json = {
        profile_url: typeof parsed.profile_url === "string" ? parsed.profile_url.trim() : "",
        projects: Array.isArray(parsed.projects)
          ? parsed.projects.filter((p) => p && p.title != null && p.url != null)
          : [],
      };
    } catch {
      return { error: "Geçersiz JSON" };
    }
  }
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "translation_academia", value_json }, { onConflict: "key" });
  if (error) return { error: error.message };
  revalidatePath("/translations");
  return { success: true };
}

/** Gönüllü projeler (settings key: translation_volunteer) */
export async function adminUpsertTranslationVolunteer(formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const raw = formData.get("translation_volunteer_json") as string | null;
  let value_json: { projects: { title: string; description: string; url: string }[] } = { projects: [] };
  if (raw?.trim()) {
    try {
      const parsed = JSON.parse(raw) as { projects?: { title: string; description: string; url: string }[] };
      value_json.projects = Array.isArray(parsed.projects)
        ? parsed.projects.filter((p) => p && p.title != null && p.url != null)
        : [];
    } catch {
      return { error: "Geçersiz JSON" };
    }
  }
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "translation_volunteer", value_json }, { onConflict: "key" });
  if (error) return { error: error.message };
  revalidatePath("/translations");
  return { success: true };
}

/** Published books (yayınlanmış kitaplar) */
export async function adminCreatePublishedBook(formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Başlık gerekli" };
  const author = (formData.get("author") as string)?.trim() || null;
  const publisher = (formData.get("publisher") as string)?.trim() || null;
  const yearRaw = (formData.get("year") as string)?.trim();
  const year = yearRaw ? parseInt(yearRaw, 10) : null;
  const cover_image = (formData.get("cover_image") as string)?.trim() || null;
  const amazon_url = (formData.get("amazon_url") as string)?.trim() || null;
  const is_released = formData.get("is_released") !== "false" && formData.get("is_released") !== "0";
  const order_index = parseInt((formData.get("order_index") as string) || "0", 10) || 0;
  const source_lang = (formData.get("source_lang") as string)?.trim() || null;
  const target_lang = (formData.get("target_lang") as string)?.trim() || null;
  const translator_note = (formData.get("translator_note") as string)?.trim() || null;
  const completionRaw = (formData.get("completion_percentage") as string)?.trim();
  const completion_percentage =
    completionRaw === "" || completionRaw === null
      ? null
      : Math.min(100, Math.max(0, parseInt(completionRaw, 10) || 0));

  const { error } = await supabase.from("published_books").insert({
    title,
    author,
    publisher,
    year,
    cover_image,
    amazon_url,
    is_released,
    order_index,
    source_lang,
    target_lang,
    translator_note,
    completion_percentage,
  });
  if (error) return { error: error.message };
  revalidatePath("/translations");
  return { success: true };
}

export async function adminUpdatePublishedBook(id: string, formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Başlık gerekli" };
  const author = (formData.get("author") as string)?.trim() || null;
  const publisher = (formData.get("publisher") as string)?.trim() || null;
  const yearRaw = (formData.get("year") as string)?.trim();
  const year = yearRaw ? parseInt(yearRaw, 10) : null;
  const cover_image = (formData.get("cover_image") as string)?.trim() || null;
  const amazon_url = (formData.get("amazon_url") as string)?.trim() || null;
  const is_released = formData.get("is_released") === "on" || formData.get("is_released") === "true";
  const order_index = parseInt((formData.get("order_index") as string) || "0", 10) || 0;
  const source_lang = (formData.get("source_lang") as string)?.trim() || null;
  const target_lang = (formData.get("target_lang") as string)?.trim() || null;
  const translator_note = (formData.get("translator_note") as string)?.trim() || null;
  const completionRaw = (formData.get("completion_percentage") as string)?.trim();
  const completion_percentage =
    completionRaw === "" || completionRaw === null
      ? null
      : Math.min(100, Math.max(0, parseInt(completionRaw, 10) || 0));

  const { error } = await supabase
    .from("published_books")
    .update({
      title,
      author,
      publisher,
      year,
      cover_image,
      amazon_url,
      is_released,
      order_index,
      source_lang,
      target_lang,
      translator_note,
      completion_percentage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/translations");
  return { success: true };
}

export async function adminDeletePublishedBook(id: string) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const { error } = await supabase.from("published_books").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/translations");
  return { success: true };
}

/** Sırayı güncelle: orderedIds sırasına göre order_index atanır (0, 1, 2, ...). */
export async function adminReorderPublishedBooks(orderedIds: string[]) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("published_books")
      .update({ order_index: i, updated_at: new Date().toISOString() })
      .eq("id", orderedIds[i]);
    if (error) return { error: error.message };
  }
  revalidatePath("/translations");
  return { success: true };
}

// --- Portfolio translations (translations_settings, translation_books, translation_independent, translation_volunteer_projects) ---

export async function adminUpdateTranslationsSettings(formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const intro_title = (formData.get("intro_title") as string)?.trim() || "Çevirilerim";
  const intro_body = (formData.get("intro_body") as string)?.trim();
  if (!intro_body) return { error: "Giriş metni (intro_body) gerekli" };
  const intro_signature = (formData.get("intro_signature") as string)?.trim() || null;
  const academia_profile_url = (formData.get("academia_profile_url") as string)?.trim() || null;

  const { data: existing } = await supabase.from("translations_settings").select("id").limit(1).maybeSingle();
  if (existing) {
    const { error } = await supabase
      .from("translations_settings")
      .update({ intro_title, intro_body, intro_signature, academia_profile_url, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("translations_settings").insert({
      intro_title,
      intro_body,
      intro_signature,
      academia_profile_url,
    });
    if (error) return { error: error.message };
  }
  revalidatePath("/translations");
  return { success: true };
}

async function uploadToBucket(
  supabase: ReturnType<typeof import("@/lib/supabase/admin").createAdminClient>,
  bucket: string,
  file: File,
  folder?: string
): Promise<{ url: string } | { error: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = folder ? `${folder}/${crypto.randomUUID()}.${ext}` : `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, await file.arrayBuffer(), {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) return { error: error.message };
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function adminCreateTranslationBook(formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Başlık gerekli" };
  const original_author = (formData.get("original_author") as string)?.trim();
  if (!original_author) return { error: "Orijinal yazar gerekli" };
  const publisher = (formData.get("publisher") as string)?.trim();
  if (!publisher) return { error: "Yayınevi gerekli" };
  const yearRaw = (formData.get("year") as string)?.trim();
  const year = yearRaw ? parseInt(yearRaw, 10) : null;
  let cover_url = (formData.get("cover_url") as string)?.trim() || "";
  const coverFile = formData.get("cover_file") as File | null;
  if (coverFile?.size && coverFile.size > 0) {
    const result = await uploadToBucket(supabase, "covers", coverFile);
    if ("error" in result) return { error: result.error };
    cover_url = result.url;
  }
  if (!cover_url) return { error: "Kapak görseli (cover_url veya cover_file) gerekli" };
  const amazon_url = (formData.get("amazon_url") as string)?.trim() || null;
  const source_lang = (formData.get("source_lang") as string)?.trim() || null;
  const target_lang = (formData.get("target_lang") as string)?.trim() || null;
  const is_released = formData.get("is_released") !== "false" && formData.get("is_released") !== "0";
  const completionRaw = (formData.get("completion_percentage") as string)?.trim();
  const completion_percentage =
    completionRaw === "" ? 100 : Math.min(100, Math.max(0, parseInt(completionRaw, 10) || 0));
  const translator_note = (formData.get("translator_note") as string)?.trim() || null;
  const status_badge = (formData.get("status_badge") as string)?.trim() || null;
  const order_index = parseInt((formData.get("order_index") as string) || "0", 10) || 0;

  const { error } = await supabase.from("translation_books").insert({
    title,
    original_author,
    publisher,
    year,
    cover_url,
    amazon_url,
    source_lang,
    target_lang,
    is_released,
    completion_percentage,
    translator_note,
    status_badge,
    order_index,
  });
  if (error) return { error: error.message };
  revalidatePath("/translations");
  return { success: true };
}

export async function adminUpdateTranslationBook(id: string, formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Başlık gerekli" };
  const original_author = (formData.get("original_author") as string)?.trim();
  if (!original_author) return { error: "Orijinal yazar gerekli" };
  const publisher = (formData.get("publisher") as string)?.trim();
  if (!publisher) return { error: "Yayınevi gerekli" };
  const yearRaw = (formData.get("year") as string)?.trim();
  const year = yearRaw ? parseInt(yearRaw, 10) : null;
  let cover_url = (formData.get("cover_url") as string)?.trim() || "";
  const coverFile = formData.get("cover_file") as File | null;
  if (coverFile?.size && coverFile.size > 0) {
    const result = await uploadToBucket(supabase, "covers", coverFile);
    if ("error" in result) return { error: result.error };
    cover_url = result.url;
  }
  const existing = await supabase.from("translation_books").select("cover_url").eq("id", id).single();
  if (!cover_url && existing.data?.cover_url) cover_url = existing.data.cover_url;
  if (!cover_url) return { error: "Kapak görseli gerekli" };
  const amazon_url = (formData.get("amazon_url") as string)?.trim() || null;
  const source_lang = (formData.get("source_lang") as string)?.trim() || null;
  const target_lang = (formData.get("target_lang") as string)?.trim() || null;
  const is_released = formData.get("is_released") === "on" || formData.get("is_released") === "true";
  const completionRaw = (formData.get("completion_percentage") as string)?.trim();
  const completion_percentage =
    completionRaw === "" ? 100 : Math.min(100, Math.max(0, parseInt(completionRaw, 10) || 0));
  const translator_note = (formData.get("translator_note") as string)?.trim() || null;
  const status_badge = (formData.get("status_badge") as string)?.trim() || null;
  const order_index = parseInt((formData.get("order_index") as string) || "0", 10) || 0;

  const { error } = await supabase
    .from("translation_books")
    .update({
      title,
      original_author,
      publisher,
      year,
      cover_url,
      amazon_url,
      source_lang,
      target_lang,
      is_released,
      completion_percentage,
      translator_note,
      status_badge,
      order_index,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/translations");
  return { success: true };
}

export async function adminDeleteTranslationBook(id: string) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const { error } = await supabase.from("translation_books").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/translations");
  return { success: true };
}

export async function adminReorderTranslationBooks(orderedIds: string[]) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase.from("translation_books").update({ order_index: i }).eq("id", orderedIds[i]);
    if (error) return { error: error.message };
  }
  revalidatePath("/translations");
  return { success: true };
}

// translation_independent
export async function adminCreateTranslationIndependent(formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Başlık gerekli" };
  const description = (formData.get("description") as string)?.trim() || null;
  const yearRaw = (formData.get("year") as string)?.trim();
  const year = yearRaw ? parseInt(yearRaw, 10) : null;
  const tagsStr = (formData.get("tags") as string)?.trim();
  const tags = tagsStr ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean) : null;
  let file_url = (formData.get("file_url") as string)?.trim() || null;
  const fileFile = formData.get("file_file") as File | null;
  if (fileFile?.size && fileFile.size > 0) {
    const result = await uploadToBucket(supabase, "translation_files", fileFile);
    if ("error" in result) return { error: result.error };
    file_url = result.url;
  }
  const external_url = (formData.get("external_url") as string)?.trim() || null;
  const order_index = parseInt((formData.get("order_index") as string) || "0", 10) || 0;

  const { error } = await supabase.from("translation_independent").insert({
    title,
    description,
    year,
    tags,
    file_url,
    external_url,
    order_index,
  });
  if (error) return { error: error.message };
  revalidatePath("/translations");
  return { success: true };
}

export async function adminUpdateTranslationIndependent(id: string, formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Başlık gerekli" };
  const description = (formData.get("description") as string)?.trim() || null;
  const yearRaw = (formData.get("year") as string)?.trim();
  const year = yearRaw ? parseInt(yearRaw, 10) : null;
  const tagsStr = (formData.get("tags") as string)?.trim();
  const tags = tagsStr ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean) : null;
  let file_url = (formData.get("file_url") as string)?.trim() || null;
  const fileFile = formData.get("file_file") as File | null;
  if (fileFile?.size && fileFile.size > 0) {
    const result = await uploadToBucket(supabase, "translation_files", fileFile);
    if ("error" in result) return { error: result.error };
    file_url = result.url;
  }
  const existing = await supabase.from("translation_independent").select("file_url").eq("id", id).single();
  if (!file_url && existing.data?.file_url) file_url = existing.data.file_url;
  const external_url = (formData.get("external_url") as string)?.trim() || null;
  const order_index = parseInt((formData.get("order_index") as string) || "0", 10) || 0;

  const { error } = await supabase
    .from("translation_independent")
    .update({ title, description, year, tags, file_url, external_url, order_index })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/translations");
  return { success: true };
}

export async function adminDeleteTranslationIndependent(id: string) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const { error } = await supabase.from("translation_independent").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/translations");
  return { success: true };
}

export async function adminReorderTranslationIndependent(orderedIds: string[]) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase.from("translation_independent").update({ order_index: i }).eq("id", orderedIds[i]);
    if (error) return { error: error.message };
  }
  revalidatePath("/translations");
  return { success: true };
}

// translation_volunteer_projects
export async function adminCreateTranslationVolunteer(formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const org_name = (formData.get("org_name") as string)?.trim();
  if (!org_name) return { error: "Kurum adı gerekli" };
  const role_title = (formData.get("role_title") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const website_url = (formData.get("website_url") as string)?.trim() || null;
  const instagram_url = (formData.get("instagram_url") as string)?.trim() || null;
  const x_url = (formData.get("x_url") as string)?.trim() || null;
  const years = (formData.get("years") as string)?.trim() || null;
  const highlightsStr = (formData.get("highlights") as string)?.trim();
  const highlights = highlightsStr ? highlightsStr.split("\n").map((h) => h.trim()).filter(Boolean) : null;
  const order_index = parseInt((formData.get("order_index") as string) || "0", 10) || 0;

  const { error } = await supabase.from("translation_volunteer_projects").insert({
    org_name,
    role_title,
    description,
    website_url,
    instagram_url,
    x_url,
    years,
    highlights,
    order_index,
  });
  if (error) return { error: error.message };
  revalidatePath("/translations");
  return { success: true };
}

export async function adminUpdateTranslationVolunteer(id: string, formData: FormData) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const org_name = (formData.get("org_name") as string)?.trim();
  if (!org_name) return { error: "Kurum adı gerekli" };
  const role_title = (formData.get("role_title") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const website_url = (formData.get("website_url") as string)?.trim() || null;
  const instagram_url = (formData.get("instagram_url") as string)?.trim() || null;
  const x_url = (formData.get("x_url") as string)?.trim() || null;
  const years = (formData.get("years") as string)?.trim() || null;
  const highlightsStr = (formData.get("highlights") as string)?.trim();
  const highlights = highlightsStr ? highlightsStr.split("\n").map((h) => h.trim()).filter(Boolean) : null;
  const order_index = parseInt((formData.get("order_index") as string) || "0", 10) || 0;

  const { error } = await supabase
    .from("translation_volunteer_projects")
    .update({ org_name, role_title, description, website_url, instagram_url, x_url, years, highlights, order_index })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/translations");
  return { success: true };
}

export async function adminDeleteTranslationVolunteer(id: string) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const { error } = await supabase.from("translation_volunteer_projects").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/translations");
  return { success: true };
}

export async function adminReorderTranslationVolunteer(orderedIds: string[]) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("translation_volunteer_projects")
      .update({ order_index: i })
      .eq("id", orderedIds[i]);
    if (error) return { error: error.message };
  }
  revalidatePath("/translations");
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
