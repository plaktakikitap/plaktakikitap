import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Photo, PhotoType } from "@/types/photos";

export type { Photo, PhotoType } from "@/types/photos";

const PHOTOS_BUCKET = "photos-media";
const SIGNED_URL_EXPIRES = 60 * 60; // 1 hour

/** Public: all photos, newest first (created_at desc). Signs storage paths to signed URLs. */
export async function getPhotosPublic(): Promise<Photo[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  const rows = (data ?? []) as Photo[];
  return signPhotoUrls(rows);
}

/** Sign image_url when it is a storage path (not http). */
async function signPhotoUrls<T extends { image_url: string }>(items: T[]): Promise<T[]> {
  const supabase = createAdminClient();
  const out = await Promise.all(
    items.map(async (item) => {
      const url = item.image_url;
      if (!url || url.startsWith("http")) return item;
      const { data } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .createSignedUrl(url, SIGNED_URL_EXPIRES);
      return { ...item, image_url: data?.signedUrl ?? url };
    })
  );
  return out;
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
      type: payload.type ?? null,
      tags: payload.tags ?? [],
      camera: payload.camera ?? null,
      year: payload.year ?? null,
    })
    .select()
    .single();
  if (error) return null;
  const signed = await signPhotoUrls([data as Photo]);
  return signed[0] ?? null;
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
  if (payload.year !== undefined) updates.year = payload.year;

  const { data, error } = await supabase
    .from("photos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  const signed = await signPhotoUrls([data as Photo]);
  return signed[0] ?? null;
}

export async function deletePhoto(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("photos").delete().eq("id", id);
  return !error;
}

/** Upload file to photos-media; returns storage path. */
export async function uploadPhotoFile(
  file: File,
  path?: string
): Promise<{ path: string } | null> {
  const supabase = createAdminClient();
  const name = path ?? `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(name, file, { upsert: true });
  if (error) return null;
  return { path: data.path };
}
