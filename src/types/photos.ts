/** DB enum: analog | digital | other (legacy filter column) */
export type PhotoType = "analog" | "digital" | "other";

/** Display / admin category (Turkish labels) */
export type PhotoCategory = "analog" | "dijital" | "diğer";

export const PHOTO_CATEGORIES: PhotoCategory[] = ["analog", "dijital", "diğer"];

export const CATEGORY_BADGE_COLORS: Record<PhotoCategory, string> = {
  analog: "#8B6F47",
  dijital: "#4A6B8A",
  diğer: "#6B7A5E",
};

export interface Photo {
  id: string;
  image_url: string;
  caption?: string | null;
  /** Shot/display date (YYYY-MM-DD), shown under photo */
  shot_at?: string | null;
  type?: PhotoType | null;
  tags: string[];
  camera: string | null;
  lens: string | null;
  film: string | null;
  category: PhotoCategory | string | null;
  year: number | null;
  created_at: string;
}

export function resolvePhotoCategory(
  photo: Pick<Photo, "category" | "type">
): PhotoCategory {
  const c = photo.category?.trim().toLowerCase();
  if (c === "analog" || c === "dijital" || c === "diğer") return c;
  if (c === "digital") return "dijital";
  if (c === "other") return "diğer";
  if (photo.type === "analog") return "analog";
  if (photo.type === "digital") return "dijital";
  return "diğer";
}

export function categoryToType(category: PhotoCategory): PhotoType {
  if (category === "analog") return "analog";
  if (category === "dijital") return "digital";
  return "other";
}

export function parsePhotoCategory(value: unknown): PhotoCategory | null {
  const v = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (v === "analog") return "analog";
  if (v === "dijital" || v === "digital") return "dijital";
  if (v === "diğer" || v === "diger" || v === "other") return "diğer";
  return null;
}

export function formatPhotoGear(
  photo: Pick<Photo, "camera" | "lens" | "film">
): string | null {
  const parts = [photo.camera, photo.lens, photo.film]
    .map((v) => v?.trim())
    .filter((v): v is string => Boolean(v));
  return parts.length ? parts.join(" · ") : null;
}
