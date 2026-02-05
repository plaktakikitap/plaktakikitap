export type VideoType = "normal_video" | "audio_book";

export interface Video {
  id: string;
  type: VideoType;
  youtube_url: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}
