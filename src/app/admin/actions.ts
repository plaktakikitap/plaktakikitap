"use server";

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
