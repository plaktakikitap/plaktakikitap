"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { Visibility } from "@/types/database";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Normalize tags for books: trim, lowercase, remove leading #, replace spaces with _ */
function normalizeBookTags(raw: string): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim().replace(/^#+/, "").toLowerCase().replace(/\s+/g, "_"))
    .filter(Boolean);
}

export async function createFilm(formData: FormData) {
  const supabase = await createServerClient();
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string || slugify(title);
  const description = formData.get("description") as string || null;
  const rating = formData.get("rating") ? parseFloat(formData.get("rating") as string) : null;
  const visibility = (formData.get("visibility") as Visibility) || "public";
  const duration_min = parseInt(formData.get("duration_min") as string, 10);
  const year = formData.get("year") ? parseInt(formData.get("year") as string, 10) : null;
  const poster_url = (formData.get("poster_url") as string) || null;
  const spine_url = (formData.get("spine_url") as string) || null;
  const review = (formData.get("review") as string) || null;
  const director = (formData.get("director") as string)?.trim() || null;
  const genreTagsRaw = formData.get("genre_tags") as string | null;
  const genre_tags = genreTagsRaw
    ? genreTagsRaw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)
    : [];
  const rating_5Raw = formData.get("rating_5") as string | null;
  const rating_5 = rating_5Raw ? parseFloat(rating_5Raw) : null;
  const watchedAtRaw = (formData.get("watched_at") as string)?.trim() || null;
  const is_favorite = formData.get("is_favorite") === "on" || formData.get("is_favorite") === "true";

  if (!watchedAtRaw) return { error: "İzlenme tarihi (watched_at) zorunludur." };
  if (Number.isNaN(duration_min) || duration_min < 1) return { error: "Süre (dk) 1 veya daha büyük olmalıdır." };
  if (rating_5 != null && !Number.isNaN(rating_5) && (rating_5 < 0 || rating_5 > 5)) return { error: "Puan 0 ile 5 arasında olmalıdır." };

  const watched_at = new Date(watchedAtRaw).toISOString();
  const favorite_order = is_favorite ? Date.now() : null;

  const { data: content, error: contentError } = await supabase
    .from("content_items")
    .insert({
      type: "film",
      title,
      slug: slug || slugify(title) + "-" + Date.now(),
      description,
      rating,
      visibility,
    })
    .select("id")
    .single();

  if (contentError) return { error: contentError.message };
  if (!content) return { error: "Failed to create content" };

  const { error: filmError } = await supabase.from("films").insert({
    content_id: content.id,
    duration_min,
    year,
    poster_url,
    spine_url,
    review,
    director,
    genre_tags: genre_tags.length ? genre_tags : null,
    rating_5: rating_5 != null && !Number.isNaN(rating_5) ? rating_5 : null,
    watched_at,
    is_favorite: is_favorite ?? false,
    favorite_order,
  });

  if (filmError) return { error: filmError.message };
  revalidatePath("/");
  revalidatePath("/cinema");
  revalidatePath("/izleme-gunlugum");
  revalidatePath("/izleme-gunlugum/filmler");
  revalidatePath("/admin");
  revalidatePath("/admin/films");
  return { success: true };
}

export async function createSeries(formData: FormData) {
  const supabase = await createServerClient();
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string || slugify(title);
  const description = formData.get("description") as string || null;
  const rating = formData.get("rating") ? parseFloat(formData.get("rating") as string) : null;
  const visibility = (formData.get("visibility") as Visibility) || "public";
  const episodeCountRaw = formData.get("episode_count") ?? formData.get("episodes_watched");
  const episode_count = parseInt(String(episodeCountRaw ?? 0), 10) || 0;
  const avg_episode_min = formData.get("avg_episode_min") ? parseInt(formData.get("avg_episode_min") as string, 10) : null;
  const total_duration_min =
    episode_count > 0 && avg_episode_min != null && avg_episode_min > 0
      ? episode_count * avg_episode_min
      : null;
  const seasons_watched = parseInt(formData.get("seasons_watched") as string, 10) || 0;
  const total_seasonsRaw = formData.get("total_seasons") as string | null;
  const total_seasons = total_seasonsRaw && total_seasonsRaw.trim() !== "" ? parseInt(total_seasonsRaw, 10) : null;
  const review = (formData.get("review") as string) || null;
  const creator_or_director = (formData.get("creator_or_director") as string)?.trim() || null;
  const watchedAtRaw = (formData.get("watched_at") as string)?.trim() || null;
  const watched_at = watchedAtRaw ? new Date(watchedAtRaw).toISOString() : new Date().toISOString();
  const poster_url = (formData.get("poster_url") as string)?.trim() || null;
  const spine_url = (formData.get("spine_url") as string)?.trim() || null;
  const is_favorite = formData.get("is_favorite") === "on" || formData.get("is_favorite") === "true";
  const favorite_order = is_favorite ? Date.now() : null;

  const { data: content, error: contentError } = await supabase
    .from("content_items")
    .insert({
      type: "series",
      title,
      slug: slug || slugify(title) + "-" + Date.now(),
      description,
      rating,
      visibility,
    })
    .select("id")
    .single();

  if (contentError) return { error: contentError.message };
  if (!content) return { error: "Failed to create content" };

  const { error: seriesError } = await supabase.from("series").insert({
    content_id: content.id,
    episodes_watched: episode_count,
    avg_episode_min,
    total_duration_min,
    seasons_watched,
    ...(total_seasons != null && !Number.isNaN(total_seasons) ? { total_seasons } : {}),
    review,
    creator_or_director: creator_or_director || null,
    watched_at,
    poster_url: poster_url || null,
    spine_url: spine_url || null,
    is_favorite: is_favorite ?? false,
    favorite_order,
  });

  if (seriesError) return { error: seriesError.message };
  revalidatePath("/");
  revalidatePath("/cinema");
  revalidatePath("/izleme-gunlugum");
  revalidatePath("/izleme-gunlugum/diziler");
  revalidatePath("/admin");
  revalidatePath("/admin/series");
  return { success: true };
}

export async function createBook(formData: FormData) {
  const supabase = await createServerClient();
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Başlık zorunludur." };
  const author = (formData.get("author") as string)?.trim() ?? "";
  const pagesRaw = (formData.get("pages") as string)?.trim();
  const page_count = pagesRaw ? parseInt(pagesRaw, 10) : null;
  if (page_count == null || Number.isNaN(page_count) || page_count < 1) {
    return { error: "Sayfa sayısı zorunludur (1 ve üzeri tam sayı)." };
  }
  const visibility = (formData.get("visibility") as Visibility) || "public";
  const spine_url = (formData.get("spine_url") as string)?.trim();
  if (!spine_url) return { error: "Sırt görseli URL'si (spine_url) zorunludur." };
  const review = (formData.get("review") as string)?.trim() || null;
  const cover_url = (formData.get("cover_url") as string)?.trim() || null;
  const tagsRaw = (formData.get("tags") as string)?.trim() || "";
  const tags = normalizeBookTags(tagsRaw);
  const status = (formData.get("status") as "reading" | "finished" | "paused" | "dropped") || "reading";
  const bookRatingRaw = (formData.get("book_rating") as string)?.trim();
  const rating =
    bookRatingRaw != null && bookRatingRaw !== ""
      ? Math.max(0, Math.min(5, parseFloat(bookRatingRaw) || 0))
      : null;
  const startDateRaw = (formData.get("start_date") as string)?.trim();
  const start_date = startDateRaw || null;
  const endDateRaw = (formData.get("end_date") as string)?.trim();
  const end_date = endDateRaw || null;
  const progressPercentRaw = (formData.get("progress_percent") as string)?.trim();
  const progress_percent =
    progressPercentRaw != null && progressPercentRaw !== ""
      ? Math.max(0, Math.min(100, parseInt(progressPercentRaw, 10) || 0))
      : null;
  const is_featured_current = formData.get("is_featured_current") === "on" || formData.get("is_featured_current") === "true";

  if (is_featured_current) {
    await supabase.from("books").update({ is_featured_current: false });
  }

  const { data: inserted, error: insertError } = await supabase.from("books").insert({
    title,
    author,
    page_count,
    status,
    rating,
    tags,
    review,
    cover_url,
    spine_url,
    start_date: start_date || null,
    end_date: end_date || null,
    progress_percent,
    visibility,
    is_featured_current,
  }).select("id").single();

  if (insertError) return { error: insertError.message };
  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath("/okuma-gunlugum");
  revalidatePath("/admin");
  revalidatePath("/admin/books");
  revalidatePath("/admin/reading-log");
  return { success: true };
}

export async function updateBook(id: string, formData: FormData) {
  const supabase = await createServerClient();
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Başlık zorunludur." };
  const author = (formData.get("author") as string)?.trim() ?? "";
  const pagesRaw = (formData.get("pages") as string)?.trim();
  const page_count = pagesRaw ? parseInt(pagesRaw, 10) : null;
  if (page_count == null || Number.isNaN(page_count) || page_count < 1) {
    return { error: "Sayfa sayısı zorunludur (1 ve üzeri tam sayı)." };
  }
  const visibility = (formData.get("visibility") as "public" | "unlisted" | "private") || "public";
  const spine_url = (formData.get("spine_url") as string)?.trim();
  if (!spine_url) return { error: "Sırt görseli URL'si (spine_url) zorunludur." };
  const review = (formData.get("review") as string)?.trim() || null;
  const cover_url = (formData.get("cover_url") as string)?.trim() || null;
  const tagsRaw = (formData.get("tags") as string)?.trim() || "";
  const tags = normalizeBookTags(tagsRaw);
  const status = (formData.get("status") as "reading" | "finished" | "paused" | "dropped") || "reading";
  const bookRatingRaw = (formData.get("book_rating") as string)?.trim();
  const rating =
    bookRatingRaw != null && bookRatingRaw !== ""
      ? Math.max(0, Math.min(5, parseFloat(bookRatingRaw) || 0))
      : null;
  const startDateRaw = (formData.get("start_date") as string)?.trim();
  const start_date = startDateRaw || null;
  const endDateRaw = (formData.get("end_date") as string)?.trim();
  const end_date = endDateRaw || null;
  const progressPercentRaw = (formData.get("progress_percent") as string)?.trim();
  const progress_percent =
    progressPercentRaw != null && progressPercentRaw !== ""
      ? Math.max(0, Math.min(100, parseInt(progressPercentRaw, 10) || 0))
      : null;
  const is_featured_current = formData.get("is_featured_current") === "on" || formData.get("is_featured_current") === "true";

  if (is_featured_current) {
    await supabase.from("books").update({ is_featured_current: false });
  }

  const { error } = await supabase
    .from("books")
    .update({
      title,
      author,
      page_count,
      status,
      rating,
      tags,
      review,
      cover_url,
      spine_url,
      start_date: start_date || null,
      end_date: end_date || null,
      progress_percent,
      visibility,
      is_featured_current,
      last_progress_update_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath("/okuma-gunlugum");
  revalidatePath("/admin");
  revalidatePath("/admin/books");
  revalidatePath("/admin/reading-log");
  return { success: true };
}

export async function deleteContent(id: string, type: "film" | "series" | "book") {
  const supabase = await createServerClient();
  if (type === "book") {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/reading-log");
  } else {
    const { error } = await supabase.from("content_items").delete().eq("id", id);
    if (error) return { error: error.message };
  }
  revalidatePath("/");
  revalidatePath("/cinema");
  revalidatePath("/books");
  revalidatePath("/okuma-gunlugum");
  revalidatePath("/admin");
  revalidatePath(`/admin/${type}s`);
  return { success: true };
}

export async function setFilmFavorite(contentId: string, isFavorite: boolean) {
  const supabase = await createServerClient();
  if (isFavorite) {
    const { data: maxRow } = await supabase
      .from("films")
      .select("favorite_order")
      .eq("is_favorite", true)
      .order("favorite_order", { ascending: false })
      .limit(1)
      .single();
    const nextOrder = (maxRow?.favorite_order ?? 0) + 1;
    const { error } = await supabase
      .from("films")
      .update({ is_favorite: true, favorite_order: nextOrder })
      .eq("content_id", contentId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("films")
      .update({ is_favorite: false, favorite_order: null })
      .eq("content_id", contentId);
    if (error) return { error: error.message };
  }
  revalidatePath("/admin/films");
  revalidatePath("/izleme-gunlugum/filmler");
  return { success: true };
}

export async function setSeriesFavorite(contentId: string, isFavorite: boolean) {
  const supabase = await createServerClient();
  if (isFavorite) {
    const { data: maxRow } = await supabase
      .from("series")
      .select("favorite_order")
      .eq("is_favorite", true)
      .order("favorite_order", { ascending: false })
      .limit(1)
      .single();
    const nextOrder = (maxRow?.favorite_order ?? 0) + 1;
    const { error } = await supabase
      .from("series")
      .update({ is_favorite: true, favorite_order: nextOrder })
      .eq("content_id", contentId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("series")
      .update({ is_favorite: false, favorite_order: null })
      .eq("content_id", contentId);
    if (error) return { error: error.message };
  }
  revalidatePath("/admin/series");
  revalidatePath("/izleme-gunlugum/diziler");
  return { success: true };
}
