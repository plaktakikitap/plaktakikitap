export type ContentType =
  | "film"
  | "series"
  | "book"
  | "post"
  | "translation"
  | "project"
  | "certificate"
  | "art"
  | "planner_entry";

export type Visibility = "public" | "unlisted" | "private";

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  slug: string | null;
  description: string | null;
  rating: number | null;
  visibility: Visibility;
  created_at: string;
  updated_at: string;
}

export interface Film {
  content_id: string;
  duration_min: number;
  year: number | null;
  poster_url: string | null;
  review: string | null;
}

export interface Series {
  content_id: string;
  avg_episode_min: number | null;
  episodes_watched: number;
  seasons_watched: number;
  review: string | null;
}

export interface Book {
  content_id: string;
  pages: number | null;
  author: string | null;
  quote: string | null;
  review: string | null;
  cover_url: string | null;
}

export interface Translation {
  content_id: string;
  author: string | null;
  original_title: string | null;
  cover_url: string | null;
  external_url: string | null;
  link_label: "buy" | "review" | null;
}

export interface MediaAsset {
  id: string;
  content_id: string | null;
  kind: "image" | "video" | "link";
  url: string;
  caption: string | null;
}

export interface PlannerEntry {
  id: string;
  content_id: string;
  entry_date: string;
}

export type PlannerEntryWithContent = ContentItem & {
  planner_entry: PlannerEntry | PlannerEntry[] | null;
  media?: MediaAsset[];
};

export type ContentItemWithDetails =
  | (ContentItem & { film: Film | null; series: null; book: null })
  | (ContentItem & { film: null; series: Series | null; book: null })
  | (ContentItem & { film: null; series: null; book: Book | null });

export interface Stats {
  totalFilms: number;
  totalSeries: number;
  totalBooks: number;
  totalWatchTimeMinutes: number;
  totalReviews: number;
}
