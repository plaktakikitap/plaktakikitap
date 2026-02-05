import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { WorksItem, WorksItemType, WorksVisibility } from "@/types/works";

export type { WorksItem, WorksItemType, WorksVisibility } from "@/types/works";

const WORKS_MEDIA_BUCKET = "works-media";
const SIGNED_URL_EXPIRES = 60 * 60; // 1 hour

export { parseYouTubeVideoId, getYouTubeThumbUrl } from "./works-utils";

/** Create signed URL for a storage path (server-only, uses service role) */
export async function getSignedUrl(path: string, expiresIn = SIGNED_URL_EXPIRES): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(WORKS_MEDIA_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/** Sign image_url for items that have storage paths (starts with path, not http) */
export async function signImageUrls<T extends { image_url?: string | null }>(items: T[]): Promise<T[]> {
  const supabase = createAdminClient();
  const out = await Promise.all(
    items.map(async (item) => {
      const url = item.image_url;
      if (!url || url.startsWith("http")) return item;
      const { data } = await supabase.storage
        .from(WORKS_MEDIA_BUCKET)
        .createSignedUrl(url, SIGNED_URL_EXPIRES);
      return { ...item, image_url: data?.signedUrl ?? item.image_url };
    })
  );
  return out;
}

/** Public: only visibility=public, ordered, grouped by type. Signs image URLs. */
export async function getWorksPublic(): Promise<{
  items: WorksItem[];
  featured: WorksItem[];
  byType: Record<WorksItemType, WorksItem[]>;
  cvDownloadUrl: string;
}> {
  const supabase = createAdminClient();
  const { data: items, error } = await supabase
    .from("works_items")
    .select("*")
    .eq("visibility", "public")
    .order("sort_order", { ascending: true });

  if (error) return { items: [], featured: [], byType: {} as Record<WorksItemType, WorksItem[]>, cvDownloadUrl: "" };

  const rows = (items ?? []) as WorksItem[];
  const withSigned = await signImageUrls(rows);
  const featured = withSigned.filter((i) => i.is_featured);
  const byType = withSigned.reduce(
    (acc, item) => {
      const t = item.type as WorksItemType;
      if (!acc[t]) acc[t] = [];
      acc[t].push(item);
      return acc;
    },
    {} as Record<WorksItemType, WorksItem[]>
  );

  const { data: settings } = await supabase
    .from("works_settings")
    .select("value")
    .eq("key", "cv_download_url")
    .maybeSingle();
  const cvDownloadUrl = (settings?.value as string) ?? "";

  return { items: withSigned, featured, byType, cvDownloadUrl };
}

/** Admin: all items, any visibility */
export async function getWorksAdmin(): Promise<WorksItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("works_items")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return [];
  const rows = (data ?? []) as WorksItem[];
  return await signImageUrls(rows);
}

export interface WorksItemInsert {
  type: WorksItemType;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  tags?: string[];
  url?: string | null;
  external_url?: string | null;
  image_url?: string | null;
  meta?: Record<string, unknown>;
  sort_order?: number;
  is_featured?: boolean;
  visibility?: WorksVisibility;
}

export async function createWorksItem(input: WorksItemInsert): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("works_items")
    .insert({
      type: input.type,
      title: input.title ?? "",
      subtitle: input.subtitle ?? null,
      description: input.description ?? null,
      tags: Array.isArray(input.tags) ? input.tags : [],
      url: input.url ?? null,
      external_url: input.external_url ?? null,
      image_url: input.image_url ?? null,
      meta: input.meta ?? {},
      sort_order: typeof input.sort_order === "number" ? input.sort_order : 0,
      is_featured: !!input.is_featured,
      visibility: input.visibility ?? "public",
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: data.id };
}

export async function updateWorksItem(
  id: string,
  input: Partial<WorksItemInsert>
): Promise<{ ok: true } | { error: string }> {
  const supabase = createAdminClient();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.type !== undefined) updates.type = input.type;
  if (input.title !== undefined) updates.title = input.title;
  if (input.subtitle !== undefined) updates.subtitle = input.subtitle;
  if (input.description !== undefined) updates.description = input.description;
  if (input.tags !== undefined) updates.tags = input.tags;
  if (input.url !== undefined) updates.url = input.url;
  if (input.external_url !== undefined) updates.external_url = input.external_url;
  if (input.image_url !== undefined) updates.image_url = input.image_url;
  if (input.meta !== undefined) updates.meta = input.meta;
  if (input.sort_order !== undefined) updates.sort_order = input.sort_order;
  if (input.is_featured !== undefined) updates.is_featured = input.is_featured;
  if (input.visibility !== undefined) updates.visibility = input.visibility;

  const { error } = await supabase.from("works_items").update(updates).eq("id", id);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function deleteWorksItem(id: string): Promise<{ ok: true } | { error: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("works_items").delete().eq("id", id);
  if (error) return { error: error.message };
  return { ok: true };
}

/** Upload file to works-media; returns storage path (not signed URL) */
export async function uploadWorksMedia(
  file: File,
  path: string
): Promise<{ path: string } | { error: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(WORKS_MEDIA_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) return { error: error.message };
  return { path: data.path };
}
