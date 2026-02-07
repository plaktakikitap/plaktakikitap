"use client";

import Image from "next/image";
import type { MessyElement, WashiVariant, PaperclipStyle } from "@/types/messy-elements";
import { clampRotation } from "@/types/messy-elements";
import { AttachmentSVG } from "./AttachmentSVG";
import { GlossyWashiTape } from "./GlossyWashiTape";

const DEFAULT_SHADOW = "0 2px 6px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.1)";
const POLAROID_SHADOW = "0 4px 14px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.12)";

/** Küçük gri blur placeholder (remote görseller için) */
const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUG/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQACEQADAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8Q/9k=";

interface MessyElementsOverlayProps {
  elements: MessyElement[];
  /** Container is relative; overlay allows overflow, book shell clips */
  className?: string;
}

function renderElement(el: MessyElement, i: number) {
  const x = Math.max(0, Math.min(1, el.x)) * 100;
  const y = Math.max(0, Math.min(1, el.y)) * 100;
  const rot = clampRotation(el.rotation ?? 0);
  const z = el.zIndex ?? 10 + i;
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) rotate(${rot}deg)`,
    transformStyle: "preserve-3d",
    zIndex: z,
    pointerEvents: "none",
  };

  switch (el.type) {
    case "photo": {
      return (
        <div
          key={i}
          className="overflow-hidden bg-white"
          style={{
            ...baseStyle,
            width: 80,
            padding: "6px 6px 20px 6px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: POLAROID_SHADOW,
          }}
        >
          <div className="relative h-14 w-full overflow-hidden rounded-sm">
            <Image
              src={el.url}
              alt=""
              width={80}
              height={56}
              className="h-full w-full object-cover"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              sizes="80px"
            />
          </div>
        </div>
      );
    }
    case "sticky_note": {
      const bg = el.color ?? "#fef08a";
      return (
        <div
          key={i}
          className="messy-ink-bleed rounded-md px-2.5 py-2 shadow"
          style={{
            ...baseStyle,
            backgroundColor: bg,
            boxShadow: DEFAULT_SHADOW,
            filter: `drop-shadow(0 2px 5px rgba(0,0,0,0.2))`,
            fontFamily: "var(--font-sans), ui-sans-serif, sans-serif",
            fontSize: 13,
            maxWidth: 110,
            color: "rgba(0,0,0,0.88)",
          }}
        >
          {el.text}
        </div>
      );
    }
    case "washi_tape": {
      const w = el.width ?? 32;
      const h = el.height ?? 10;
      const variant = (el.variant ?? "pink") as WashiVariant;
      return (
        <div
          key={i}
          style={{
            ...baseStyle,
            width: w,
            height: h,
            filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.15))",
          }}
        >
          <GlossyWashiTape variant={variant} rotateDeg={rot} className="h-full w-full opacity-92" />
        </div>
      );
    }
    case "paperclip": {
      const size = el.size ?? 24;
      const style = (el.style ?? "standard_clip") as PaperclipStyle;
      return (
        <div
          key={i}
          style={{
            ...baseStyle,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25)) drop-shadow(0 0 0 1px rgba(0,0,0,0.05))",
          }}
        >
          <AttachmentSVG style={style} size={size} />
        </div>
      );
    }
    case "sticker": {
      const w = el.width ?? 32;
      const h = el.height ?? 32;
      return (
        <div
          key={i}
          style={{
            ...baseStyle,
            width: w,
            height: h,
            filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.15))",
          }}
        >
          <Image
            src={el.imageUrl}
            alt=""
            width={w}
            height={h}
            className="h-full w-full object-contain"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            sizes="32px"
          />
        </div>
      );
    }
    case "text_block": {
      const fs = el.fontSize ?? 14;
      return (
        <div
          key={i}
          className="messy-ink-bleed whitespace-pre-wrap"
          style={{
            ...baseStyle,
            fontFamily: "var(--font-sans), ui-sans-serif, sans-serif",
            fontSize: fs,
            color: "rgba(0,0,0,0.88)",
            maxWidth: 140,
            filter: "drop-shadow(0 0.5px 1px rgba(0,0,0,0.08))",
          }}
        >
          {el.text}
        </div>
      );
    }
    case "doodle": {
      const w = el.width ?? 40;
      const h = el.height ?? 40;
      const isPath = el.svg.trim().startsWith("M") || el.svg.trim().startsWith("m");
      return (
        <div
          key={i}
          style={{
            ...baseStyle,
            width: w,
            height: h,
            filter: "drop-shadow(0 0.5px 1px rgba(0,0,0,0.12))",
          }}
        >
          {isPath ? (
            <svg viewBox="0 0 40 40" className="h-full w-full" style={{ overflow: "visible" }}>
              <path
                d={el.svg}
                fill="none"
                stroke="rgba(0,0,0,0.5)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: el.svg }} className="h-full w-full [&>svg]:h-full [&>svg]:w-full [&>svg]:overflow-visible" />
          )}
        </div>
      );
    }
    case "coffee_stain": {
      const size = el.size ?? 64;
      return (
        <div
          key={i}
          className="rounded-full"
          style={{
            ...baseStyle,
            width: size,
            height: size,
            background: "radial-gradient(ellipse 50% 50%, rgba(130,90,55,0.35) 0%, transparent 65%)",
            filter: "blur(8px)",
            opacity: 0.18,
          }}
        />
      );
    }
    default:
      return null;
  }
}

/**
 * Her spread üzerinde absolute konumlu overlay: photo, sticky_note, washi_tape, paperclip, sticker, text_block, doodle, coffee_stain.
 * Sayfa container relative; elementler overflow:visible ile kenardan taşabilir; book shell overflow:hidden ile keser.
 */
export function MessyElementsOverlay({ elements, className = "" }: MessyElementsOverlayProps) {
  if (!elements.length) return null;
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ overflow: "visible", zIndex: 20, isolation: "isolate", transformStyle: "preserve-3d" }}
      aria-hidden
    >
      {elements.map((el, i) => renderElement(el, i))}
    </div>
  );
}
