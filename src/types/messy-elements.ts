/**
 * Messy BuJo overlay element types.
 * All positions x,y in 0–1 (percentage of page). Rotation in degrees -8..+8.
 */

export type MessyElementType =
  | "photo"
  | "sticky_note"
  | "washi_tape"
  | "paperclip"
  | "sticker"
  | "text_block"
  | "doodle"
  | "coffee_stain";

export type WashiVariant = "pink" | "blue" | "mint" | "gold" | "beige";
export type PaperclipStyle = "standard_clip" | "colorful_clip" | "binder_clip" | "staple";

export interface MessyElementBase {
  type: MessyElementType;
  x: number;
  y: number;
  rotation?: number;
  zIndex?: number;
}

export interface MessyPhotoElement extends MessyElementBase {
  type: "photo";
  url: string;
  /** Polaroid-style: more prominent shadow */
}

export interface MessyStickyNoteElement extends MessyElementBase {
  type: "sticky_note";
  text: string;
  color?: string;
}

export interface MessyWashiTapeElement extends MessyElementBase {
  type: "washi_tape";
  variant?: WashiVariant;
  width?: number;
  height?: number;
}

export interface MessyPaperclipElement extends MessyElementBase {
  type: "paperclip";
  style?: PaperclipStyle;
  size?: number;
}

export interface MessyStickerElement extends MessyElementBase {
  type: "sticker";
  imageUrl: string;
  width?: number;
  height?: number;
}

export interface MessyTextBlockElement extends MessyElementBase {
  type: "text_block";
  text: string;
  fontSize?: number;
}

export interface MessyDoodleElement extends MessyElementBase {
  type: "doodle";
  /** Inline SVG path or full SVG string */
  svg: string;
  width?: number;
  height?: number;
}

export interface MessyCoffeeStainElement extends MessyElementBase {
  type: "coffee_stain";
  /** Very low opacity overlay */
  size?: number;
}

export type MessyElement =
  | MessyPhotoElement
  | MessyStickyNoteElement
  | MessyWashiTapeElement
  | MessyPaperclipElement
  | MessyStickerElement
  | MessyTextBlockElement
  | MessyDoodleElement
  | MessyCoffeeStainElement;

export function clampRotation(deg: number): number {
  return Math.max(-8, Math.min(8, deg));
}
