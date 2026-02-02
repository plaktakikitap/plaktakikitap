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
  const review = (formData.get("review") as string) || null;

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
    review,
  });

  if (filmError) return { error: filmError.message };
  revalidatePath("/");
  revalidatePath("/cinema");
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
  const avg_episode_min = formData.get("avg_episode_min") ? parseInt(formData.get("avg_episode_min") as string, 10) : null;
  const episodes_watched = parseInt(formData.get("episodes_watched") as string, 10) || 0;
  const seasons_watched = parseInt(formData.get("seasons_watched") as string, 10) || 0;
  const review = (formData.get("review") as string) || null;

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
    avg_episode_min,
    episodes_watched,
    seasons_watched,
    review,
  });

  if (seriesError) return { error: seriesError.message };
  revalidatePath("/");
  revalidatePath("/cinema");
  revalidatePath("/admin");
  revalidatePath("/admin/series");
  return { success: true };
}

export async function createBook(formData: FormData) {
  const supabase = await createServerClient();
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string || slugify(title);
  const description = formData.get("description") as string || null;
  const rating = formData.get("rating") ? parseFloat(formData.get("rating") as string) : null;
  const visibility = (formData.get("visibility") as Visibility) || "public";
  const pages = formData.get("pages") ? parseInt(formData.get("pages") as string, 10) : null;
  const author = (formData.get("author") as string) || null;
  const quote = (formData.get("quote") as string) || null;
  const review = (formData.get("review") as string) || null;
  const cover_url = (formData.get("cover_url") as string) || null;

  const { data: content, error: contentError } = await supabase
    .from("content_items")
    .insert({
      type: "book",
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

  const { error: bookError } = await supabase.from("books").insert({
    content_id: content.id,
    pages,
    author,
    quote,
    review,
    cover_url,
  });

  if (bookError) return { error: bookError.message };
  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath("/admin");
  revalidatePath("/admin/books");
  return { success: true };
}

export async function deleteContent(id: string, type: "film" | "series" | "book") {
  const supabase = await createServerClient();
  const { error } = await supabase.from("content_items").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/cinema");
  revalidatePath("/books");
  revalidatePath("/admin");
  revalidatePath(`/admin/${type}s`);
  return { success: true };
}
