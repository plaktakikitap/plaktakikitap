import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseYouTubeVideoId, getYouTubeThumbUrl } from "@/lib/works-utils";
import type { Video, VideoType } from "@/types/videos";

export type { Video, VideoType } from "@/types/videos";

/** Public: all videos, by sort_order then published_at */
export async function getVideosPublic(): Promise<Video[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) return [];
  return (data ?? []) as Video[];
}

/** Latest or featured video for homepage card. No iframe; poster + title only. */
export async function getLatestVideo(): Promise<Video | null> {
  const supabase = createAdminClient();
  const { data: featured } = await supabase
    .from("videos")
    .select("*")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (featured) return featured as Video;

  const { data: latest } = await supabase
    .from("videos")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  return (latest as Video) ?? null;
}

/** Resolve thumbnail: use thumbnail_url if set, else from YouTube URL. */
export function getVideoThumbnail(v: Video): string {
  if (v.thumbnail_url?.startsWith("http")) return v.thumbnail_url;
  const id = parseYouTubeVideoId(v.youtube_url);
  return id ? getYouTubeThumbUrl(id) : "";
}

/** Admin: all videos */
export async function getVideosAdmin(): Promise<Video[]> {
  return getVideosPublic();
}

export interface VideoInsert {
  type?: VideoType;
  youtube_url: string;
  title?: string;
  description?: string | null;
  thumbnail_url?: string | null;
  published_at?: string | null;
  is_featured?: boolean;
  sort_order?: number;
}

export async function createVideo(payload: VideoInsert): Promise<Video | null> {
  const supabase = createAdminClient();
  const type = payload.type === "audio_book" ? "audio_book" : "normal_video";
  const thumb =
    type === "audio_book"
      ? null
      : payload.thumbnail_url?.startsWith("http")
        ? payload.thumbnail_url
        : parseYouTubeVideoId(payload.youtube_url)
          ? getYouTubeThumbUrl(parseYouTubeVideoId(payload.youtube_url)!)
          : null;

  const { data, error } = await supabase
    .from("videos")
    .insert({
      type,
      youtube_url: payload.youtube_url,
      title: payload.title ?? "",
      description: payload.description ?? null,
      thumbnail_url: thumb ?? payload.thumbnail_url ?? null,
      published_at: payload.published_at ?? null,
      is_featured: payload.is_featured ?? false,
      sort_order: payload.sort_order ?? 0,
    })
    .select()
    .single();
  if (error) return null;
  return data as Video;
}

export async function updateVideo(
  id: string,
  payload: Partial<VideoInsert>
): Promise<Video | null> {
  const supabase = createAdminClient();
  const updates: Record<string, unknown> = { ...payload };
  if (payload.type === "audio_book") {
    updates.thumbnail_url = null;
  } else if (payload.youtube_url != null && payload.thumbnail_url === undefined) {
    const vid = parseYouTubeVideoId(payload.youtube_url);
    if (vid) updates.thumbnail_url = getYouTubeThumbUrl(vid);
  }
  const { data, error } = await supabase
    .from("videos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data as Video;
}

export async function deleteVideo(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("videos").delete().eq("id", id);
  return !error;
}
