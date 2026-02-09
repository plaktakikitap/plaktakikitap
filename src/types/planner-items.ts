export type PlannerItemType =
  | "photo"
  | "polaroid"
  | "sticker"
  | "postit"
  | "tape"
  | "paperclip"
  | "text"
  | "doodle"
  | "coffee_stain";

export interface PlannerItem {
  id: string;
  page_id: string;
  page_side: "left" | "right";
  type: PlannerItemType;
  asset_url: string | null;
  text_content: string | null;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  z_index: number;
  style_json: Record<string, unknown>;
  created_at?: string;
}

export interface PlannerItemStyle {
  color?: string;
  font?: string;
  shadow?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}
