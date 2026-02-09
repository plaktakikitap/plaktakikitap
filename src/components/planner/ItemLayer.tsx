"use client";

import Image from "next/image";
import type { PlannerItem } from "@/types/planner-items";
import { AttachmentSVG } from "./AttachmentSVG";

const DEFAULT_SHADOW = "0 2px 6px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.1)";
const POLAROID_SHADOW = "0 4px 14px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.12)";

const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUG/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQACEQADAP/EABQRAQAAAAAAAAAAAAAAAAAAAAA/2gAIAQEAAT8Q/9k=";

interface ItemLayerProps {
  items: PlannerItem[];
  pageSide: "left" | "right";
  pageWidth: number;
  pageHeight: number;
  /** For read-only display (no interaction) */
  interactive?: boolean;
}

function renderItem(
  item: PlannerItem,
  pageWidth: number,
  pageHeight: number
) {
  const x = Math.max(0, Math.min(100, item.x));
  const y = Math.max(0, Math.min(100, item.y));
  const rot = item.rotation ?? 0;
  const scale = Math.max(0.1, Math.min(3, item.scale ?? 1));
  const style = (item.style_json ?? {}) as Record<string, unknown>;
  const color = (style.color as string) ?? "#fef08a";
  const width = (style.width as number) ?? 80;
  const height = (style.height as number) ?? 60;

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`,
    transformOrigin: "center center",
    zIndex: item.z_index ?? 1,
    pointerEvents: "none",
  };

  switch (item.type) {
    case "photo":
      if (!item.asset_url) return null;
      return (
        <div
          key={item.id}
          className="overflow-hidden bg-white"
          style={{
            ...baseStyle,
            width,
            height,
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: DEFAULT_SHADOW,
          }}
        >
          <Image
            src={item.asset_url}
            alt=""
            width={width}
            height={height}
            className="h-full w-full object-cover"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            sizes={`${width}px`}
          />
        </div>
      );

    case "polaroid":
      if (!item.asset_url) return null;
      return (
        <div
          key={item.id}
          className="overflow-hidden bg-white"
          style={{
            ...baseStyle,
            width: width || 100,
            padding: "6px 6px 20px 6px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: POLAROID_SHADOW,
          }}
        >
          <div className="relative h-20 w-full overflow-hidden rounded-sm">
            <Image
              src={item.asset_url}
              alt=""
              width={width || 100}
              height={80}
              className="h-full w-full object-cover"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              sizes="100px"
            />
          </div>
        </div>
      );

    case "sticker":
      if (!item.asset_url) return null;
      return (
        <div key={item.id} style={baseStyle}>
          <Image
            src={item.asset_url}
            alt=""
            width={48}
            height={48}
            className="drop-shadow-md"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            sizes="48px"
          />
        </div>
      );

    case "postit":
      return (
        <div
          key={item.id}
          className="rounded-md px-2.5 py-2 shadow"
          style={{
            ...baseStyle,
            backgroundColor: color,
            boxShadow: DEFAULT_SHADOW,
            filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.2))",
            fontFamily: "var(--font-handwriting), cursive",
            fontSize: 13,
            maxWidth: 120,
            color: "rgba(0,0,0,0.88)",
          }}
        >
          {item.text_content || ""}
        </div>
      );

    case "tape":
      return (
        <div
          key={item.id}
          className="opacity-90"
          style={{
            ...baseStyle,
            width: width || 40,
            height: 16,
            background: "linear-gradient(180deg, rgba(255,240,220,0.9) 0%, rgba(248,220,180,0.9) 100%)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)",
            transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`,
          }}
        />
      );

    case "paperclip":
      return (
        <div
          key={item.id}
          style={{
            ...baseStyle,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
          }}
        >
          <AttachmentSVG style="standard_clip" size={24} />
        </div>
      );

    case "text":
      return (
        <div
          key={item.id}
          style={{
            ...baseStyle,
            fontFamily: "var(--font-handwriting), cursive",
            fontSize: 14,
            color: "rgba(0,0,0,0.9)",
            maxWidth: 150,
          }}
        >
          {item.text_content || ""}
        </div>
      );

    case "doodle":
      return (
        <div
          key={item.id}
          className="opacity-80"
          style={{
            ...baseStyle,
            fontFamily: "var(--font-handwriting-doodle), cursive",
            fontSize: 16,
            color: "rgba(0,0,0,0.7)",
          }}
        >
          {item.text_content || "~"}
        </div>
      );

    case "coffee_stain":
      return (
        <div
          key={item.id}
          className="opacity-40 mix-blend-multiply"
          style={{
            ...baseStyle,
            width: 60,
            height: 60,
            background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(100,70,40,0.4) 0%, transparent 70%)",
            filter: "blur(2px)",
          }}
        />
      );

    default:
      return null;
  }
}

export function ItemLayer({
  items,
  pageSide,
  pageWidth,
  pageHeight,
  interactive = false,
}: ItemLayerProps) {
  const filtered = items.filter((it) => it.page_side === pageSide);
  const sorted = [...filtered].sort((a, b) => (a.z_index ?? 0) - (b.z_index ?? 0));

  return (
    <div
      className="absolute inset-0 overflow-visible pointer-events-none"
      style={{ zIndex: 10 }}
      aria-hidden={!interactive}
    >
      {sorted.map((item) => renderItem(item, pageWidth, pageHeight))}
    </div>
  );
}
