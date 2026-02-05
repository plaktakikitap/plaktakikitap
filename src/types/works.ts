export type WorksItemType =
  | "youtube"
  | "art"
  | "photo"
  | "experience"
  | "project"
  | "certificate"
  | "software"
  | "cv_role";

export type WorksVisibility = "public" | "unlisted" | "private";

export interface WorksItem {
  id: string;
  type: WorksItemType;
  title: string;
  subtitle: string | null;
  description: string | null;
  tags: string[];
  url: string | null;
  external_url: string | null;
  image_url: string | null;
  meta: Record<string, unknown>;
  sort_order: number;
  is_featured: boolean;
  visibility: WorksVisibility;
  created_at: string;
  updated_at: string;
}
