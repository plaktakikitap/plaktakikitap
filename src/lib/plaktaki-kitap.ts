import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseYouTubeVideoId, getYouTubeHqDefaultThumbUrl } from "@/lib/works-utils";

export interface PlaktakiKitapSettingsRow {
  id: string;
  intro_text: string;
  youtube_channel_url: string;
  youtube_channel_id: string;
  spotify_profile_url: string | null;
  updated_at: string;
}

export type PlaktakiKitapItemType = "video" | "audio_book";

export interface PlaktakiKitapItemRow {
  id: string;
  type: PlaktakiKitapItemType;
  title: string;
  description: string | null;
  youtube_url: string;
  youtube_video_id: string;
  custom_thumbnail_url: string | null;
  tags: string[];
  duration_min: number | null;
  is_featured: boolean;
  order_index: number;
  created_at: string;
}

/** Public: get single settings row (singleton) */
export async function getPlaktakiKitapSettings(): Promise<PlaktakiKitapSettingsRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("plaktaki_kitap_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return {
    ...data,
    tags: (data as { tags?: string[] }).tags ?? [],
  } as PlaktakiKitapSettingsRow;
}

/** Public: all items for display — featured first, then order_index asc, then created_at desc */
export async function getPlaktakiKitapItems(): Promise<PlaktakiKitapItemRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("plaktaki_kitap_items")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false, nullsFirst: false });
  if (error) return [];
  return (data ?? []) as PlaktakiKitapItemRow[];
}

/** Resolve thumbnail: custom or YouTube hqdefault */
export function getPlaktakiKitapItemThumbUrl(item: PlaktakiKitapItemRow): string {
  if (item.custom_thumbnail_url?.startsWith("http")) return item.custom_thumbnail_url;
  return getYouTubeHqDefaultThumbUrl(item.youtube_video_id);
}

/** Ensure youtube_video_id is set from youtube_url */
function ensureVideoId(url: string): string | null {
  return parseYouTubeVideoId(url);
}

export interface PlaktakiKitapSettingsUpdate {
  intro_text?: string;
  youtube_channel_url?: string;
  youtube_channel_id?: string;
  spotify_profile_url?: string | null;
}

export async function updatePlaktakiKitapSettings(
  payload: PlaktakiKitapSettingsUpdate
): Promise<PlaktakiKitapSettingsRow | null> {
  const supabase = createAdminClient();
  const { data: existing } = await supabase.from("plaktaki_kitap_settings").select("id").limit(1).maybeSingle();
  const row = {
    ...(payload.intro_text !== undefined && { intro_text: payload.intro_text }),
    ...(payload.youtube_channel_url !== undefined && { youtube_channel_url: payload.youtube_channel_url }),
    ...(payload.youtube_channel_id !== undefined && { youtube_channel_id: payload.youtube_channel_id }),
    ...(payload.spotify_profile_url !== undefined && { spotify_profile_url: payload.spotify_profile_url }),
    updated_at: new Date().toISOString(),
  };
  if (existing?.id) {
    const { data, error } = await supabase
      .from("plaktaki_kitap_settings")
      .update(row)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) return null;
    return data as PlaktakiKitapSettingsRow;
  }
  const { data, error } = await supabase
    .from("plaktaki_kitap_settings")
    .insert({
      intro_text: payload.intro_text ?? "",
      youtube_channel_url: payload.youtube_channel_url ?? "",
      youtube_channel_id: payload.youtube_channel_id ?? "",
      spotify_profile_url: payload.spotify_profile_url ?? null,
    })
    .select()
    .single();
  if (error) return null;
  return data as PlaktakiKitapSettingsRow;
}

export interface PlaktakiKitapItemInsert {
  type: PlaktakiKitapItemType;
  title: string;
  description?: string | null;
  youtube_url: string;
  custom_thumbnail_url?: string | null;
  tags?: string[];
  duration_min?: number | null;
  is_featured?: boolean;
  order_index?: number;
}

export async function createPlaktakiKitapItem(
  payload: PlaktakiKitapItemInsert
): Promise<PlaktakiKitapItemRow | null> {
  const videoId = ensureVideoId(payload.youtube_url);
  if (!videoId) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("plaktaki_kitap_items")
    .insert({
      type: payload.type,
      title: payload.title.trim() || "",
      description: payload.description?.trim() || null,
      youtube_url: payload.youtube_url.trim(),
      youtube_video_id: videoId,
      custom_thumbnail_url: payload.type === "video" ? (payload.custom_thumbnail_url?.trim() || null) : null,
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      duration_min: payload.duration_min ?? null,
      is_featured: payload.is_featured ?? false,
      order_index: payload.order_index ?? 0,
    })
    .select()
    .single();
  if (error) return null;
  return data as PlaktakiKitapItemRow;
}

export interface PlaktakiKitapItemUpdate {
  title?: string;
  description?: string | null;
  youtube_url?: string;
  custom_thumbnail_url?: string | null;
  tags?: string[];
  duration_min?: number | null;
  is_featured?: boolean;
  order_index?: number;
}

export async function updatePlaktakiKitapItem(
  id: string,
  payload: PlaktakiKitapItemUpdate
): Promise<PlaktakiKitapItemRow | null> {
  const supabase = createAdminClient();
  const updates: Record<string, unknown> = { ...payload };
  if (payload.youtube_url !== undefined) {
    const videoId = ensureVideoId(payload.youtube_url);
    if (videoId) updates.youtube_video_id = videoId;
    updates.youtube_url = payload.youtube_url.trim();
  }
  if (payload.custom_thumbnail_url === null || payload.custom_thumbnail_url === "") {
    updates.custom_thumbnail_url = null;
  }
  const { data, error } = await supabase
    .from("plaktaki_kitap_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data as PlaktakiKitapItemRow;
}

export async function deletePlaktakiKitapItem(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("plaktaki_kitap_items").delete().eq("id", id);
  return !error;
}

export async function reorderPlaktakiKitapItems(
  orderedIds: string[]
): Promise<boolean> {
  const supabase = createAdminClient();
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("plaktaki_kitap_items")
      .update({ order_index: i })
      .eq("id", orderedIds[i]);
    if (error) return false;
  }
  return true;
}
