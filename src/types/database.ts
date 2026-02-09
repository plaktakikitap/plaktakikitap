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
  spine_url?: string | null;
  review: string | null;
  director?: string | null;
  genre_tags?: string[] | null;
  /** 0-5 arası; 0.25 ve 0.5 adımları */
  rating_5?: number | null;
  /** Eymen'in Favori 5'lisi vitrininde göster */
  is_favorite?: boolean;
  /** Vitrin sırası (büyük = en son eklenen) */
  favorite_order?: number | null;
  /** İzlenme tarihi; "Son izlediğim" ve raf sırası */
  watched_at?: string | null;
}

export interface Series {
  content_id: string;
  /** Ortalama bölüm süresi (dk). Admin: episode_count + avg_episode_min → total_duration_min. */
  avg_episode_min: number | null;
  /** Bölüm sayısı (episode_count). */
  episodes_watched: number;
  seasons_watched: number;
  /** Dizinin toplam sezon sayısı */
  total_seasons?: number | null;
  /** episode_count * avg_episode_min; stored on save. Stats use this for totals. */
  total_duration_min?: number | null;
  review: string | null;
  /** Eymen'in Favori 5'lisi vitrininde göster */
  is_favorite?: boolean;
  /** Vitrin sırası (büyük = en son eklenen) */
  favorite_order?: number | null;
  /** İzlenme tarihi; "Son izlediğim" ve raf sırası */
  watched_at?: string | null;
  /** Dizi yaratıcısı veya yönetmeni */
  creator_or_director?: string | null;
  /** Ön kapak (poster) görseli */
  poster_url?: string | null;
  /** DVD spine (yan yüz) görseli */
  spine_url?: string | null;
}

/** Reading log: standalone books table (id, title, author, ...) */
export type BookStatus = "reading" | "finished" | "paused" | "dropped";

export interface Book {
  id: string;
  title: string;
  author: string;
  page_count: number;
  status: BookStatus;
  rating: number | null;
  tags: string[];
  review: string | null;
  quote?: string | null;
  cover_url: string | null;
  spine_url: string;
  start_date: string | null;
  end_date: string | null;
  last_progress_update_at: string;
  progress_percent: number | null;
  created_at: string;
  visibility?: Visibility;
  /** Öne çıkan "şu an okuyorum" (en fazla bir kitap true) */
  is_featured_current?: boolean;
  /** Legacy alias for spine width calc */
  pages?: number | null;
}

export interface Translation {
  content_id: string;
  author: string | null;
  original_title: string | null;
  cover_url: string | null;
  external_url: string | null;
  link_label: "buy" | "review" | null;
}

/** Yayınlanmış kitaplar (çeviriler sayfası); is_released=false = Çok Yakında */
export interface PublishedBook {
  id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  year: number | null;
  cover_image: string | null;
  amazon_url: string | null;
  is_released: boolean;
  order_index: number;
  source_lang: string | null;
  target_lang: string | null;
  translator_note: string | null;
  completion_percentage: number | null;
  created_at: string;
  updated_at: string;
}

// --- Portfolio translations (new schema) ---

export interface TranslationsSettingsRow {
  id: string;
  intro_title: string;
  intro_body: string;
  intro_signature: string | null;
  academia_profile_url: string | null;
  updated_at: string;
}

export interface TranslationBookRow {
  id: string;
  title: string;
  original_author: string;
  publisher: string;
  year: number | null;
  cover_url: string;
  amazon_url: string | null;
  source_lang: string | null;
  target_lang: string | null;
  is_released: boolean;
  completion_percentage: number;
  translator_note: string | null;
  status_badge: string | null;
  order_index: number;
  created_at: string;
}

export interface TranslationIndependentRow {
  id: string;
  title: string;
  description: string | null;
  year: number | null;
  tags: string[] | null;
  file_url: string | null;
  external_url: string | null;
  order_index: number;
  created_at: string;
}

export interface TranslationVolunteerProjectRow {
  id: string;
  org_name: string;
  role_title: string | null;
  description: string | null;
  website_url: string | null;
  instagram_url: string | null;
  x_url: string | null;
  years: string | null;
  highlights: string[] | null;
  order_index: number;
  created_at: string;
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
