/** DB enum: analog | digital | other (used for filtering) */
export type PhotoType = "analog" | "digital" | "other";

export interface Photo {
  id: string;
  image_url: string;
  caption?: string | null;
  /** Shot/display date (YYYY-MM-DD), shown under photo */
  shot_at?: string | null;
  type?: PhotoType | null;
  tags: string[];
  camera: string | null;
  year: number | null;
  created_at: string;
}
