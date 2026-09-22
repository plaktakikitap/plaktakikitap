import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Photo, PhotoCategory, PhotoType } from "@/types/photos";
import { categoryToType, parsePhotoCategory } from "@/types/photos";

export type { Photo, PhotoCategory, PhotoType } from "@/types/photos";

const PHOTOS_BUCKET = "photos-media";
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function publicPhotoUrl(supabase: ReturnType<typeof createAdminClient>, pathOrUrl: string): string {
  if (!pathOrUrl) return pathOrUrl;
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(pathOrUrl);
  return data.publicUrl;
}

/** Public: all photos, newest first. Resolves storage paths to public URLs. */
export async function getPhotosPublic(): Promise<Photo[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("photos")
    .select("id, image_url, caption, shot_at, created_at, type, camera, lens, film, category")
    .order("created_at", { ascending: false });

  if (error) return [];
  const rows = (data ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    tags: r.tags ?? [],
    camera: r.camera ?? null,
    lens: r.lens ?? null,
    film: r.film ?? null,
    category: parsePhotoCategory(r.category) ?? r.category ?? null,
    year: r.year ?? null,
  })) as Photo[];
  return resolvePhotoUrls(rows);
}

/** Resolve image_url when it is a storage path (not http). */
async function resolvePhotoUrls<T extends { image_url: string }>(items: T[]): Promise<T[]> {
  const supabase = createAdminClient();
  return items.map((item) => ({
    ...item,
    image_url: publicPhotoUrl(supabase, item.image_url),
  }));
}

/** Admin: all photos */
export async function getPhotosAdmin(): Promise<Photo[]> {
  return getPhotosPublic();
}

export interface PhotoInsert {
  image_url: string;
  caption?: string | null;
  shot_at?: string | null;
  type?: PhotoType | null;
  tags?: string[];
  camera?: string | null;
  lens?: string | null;
  film?: string | null;
  category?: PhotoCategory | null;
  year?: number | null;
}

export async function createPhoto(payload: PhotoInsert): Promise<Photo | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("photos")
    .insert({
      image_url: payload.image_url,
      caption: payload.caption ?? null,
      shot_at: payload.shot_at ?? null,
      type: payload.type ?? (payload.category ? categoryToType(payload.category) : null),
      tags: payload.tags ?? [],
      camera: payload.camera ?? null,
      lens: payload.lens ?? null,
      film: payload.film ?? null,
      category: payload.category ?? "dijital",
      year: payload.year ?? null,
    })
    .select()
    .single();
  if (error) return null;
  const resolved = await resolvePhotoUrls([data as Photo]);
  return resolved[0] ?? null;
}

export async function updatePhoto(
  id: string,
  payload: Partial<PhotoInsert>
): Promise<Photo | null> {
  const supabase = createAdminClient();
  const updates: Record<string, unknown> = {};
  if (payload.image_url !== undefined) updates.image_url = payload.image_url;
  if (payload.caption !== undefined) updates.caption = payload.caption;
  if (payload.shot_at !== undefined) updates.shot_at = payload.shot_at;
  if (payload.type !== undefined) updates.type = payload.type;
  if (payload.tags !== undefined) updates.tags = payload.tags;
  if (payload.camera !== undefined) updates.camera = payload.camera;
  if (payload.lens !== undefined) updates.lens = payload.lens;
  if (payload.film !== undefined) updates.film = payload.film;
  if (payload.category !== undefined) {
    updates.category = payload.category;
    if (payload.type === undefined && payload.category) {
      updates.type = categoryToType(payload.category);
    }
  }
  if (payload.year !== undefined) updates.year = payload.year;

  const { data, error } = await supabase
    .from("photos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("updatePhoto", error);
    return null;
  }
  const resolved = await resolvePhotoUrls([data as Photo]);
  return resolved[0] ?? null;
}

export async function deletePhoto(id: string): Promise<boolean | { error: string }> {
  const supabase = createAdminClient();
  const { data: row, error: fetchErr } = await supabase
    .from("photos")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr) return { error: fetchErr.message };
  if (!row) return { error: "Fotoğraf bulunamadı." };

  const imageUrl = row.image_url as string;
  // Storage path (not full URL)
  if (imageUrl && !imageUrl.startsWith("http")) {
    const { error: storageError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .remove([imageUrl]);
    if (storageError) {
      console.error("Photo storage delete:", storageError);
      return { error: "Dosya silinemedi" };
    }
  } else if (imageUrl?.includes(`/${PHOTOS_BUCKET}/`)) {
    const path = imageUrl.split(`/${PHOTOS_BUCKET}/`)[1];
    if (path) {
      const { error: storageError } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .remove([path]);
      if (storageError) {
        console.error("Photo storage delete:", storageError);
        return { error: "Dosya silinemedi" };
      }
    }
  }

  const { error } = await supabase.from("photos").delete().eq("id", id);
  if (error) return { error: error.message };
  return true;
}


export type UploadPhotoResult =
  | { path: string }
  | { error: string };

function uniquePhotoFileName(file: File): string {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const rand = Math.random().toString(36).slice(2, 11);
  return `${Date.now()}-${rand}.${ext}`;
}

/** Upload file to photos-media; returns storage path (not public URL). */
export async function uploadPhotoFile(
  file: File,
  path?: string
): Promise<UploadPhotoResult> {
  if (!file?.size) {
    return { error: "Dosya seçin." };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { error: "Dosya 10MB'tan küçük olmalı." };
  }
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    return { error: "Sadece JPG, PNG, WEBP veya GIF yüklenebilir." };
  }

  const supabase = createAdminClient();
  const name = path?.trim() || uniquePhotoFileName(file);
  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(name, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    console.error("Upload hatası:", error);
    if (error.message?.toLowerCase().includes("already exists")) {
      return { error: "Aynı isimde dosya zaten var. Tekrar deneyin." };
    }
    return { error: `Yükleme başarısız: ${error.message}` };
  }
  return { path: data.path };
}
