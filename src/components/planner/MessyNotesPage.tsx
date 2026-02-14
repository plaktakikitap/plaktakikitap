"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { PlannerDaySummary, AttachmentStyle, PlannerCanvasItem } from "@/lib/planner";
import { AttachmentSVG } from "./AttachmentSVG";
import { GlossyWashiTape } from "./GlossyWashiTape";

const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUG/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQACEQADAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8Q/9k=";

interface CustomField {
  label: string;
  content: string;
}

interface MessyNotesPageProps {
  monthName: string;
  summaries: PlannerDaySummary[];
  onDayClick: (dateStr: string, monthName: string, day: number) => void;
  images?: { url: string; dateStr?: string }[];
  paperclipImages?: { url: string; dateStr?: string }[];
  attachedImages?: { url: string; style: AttachmentStyle }[];
  showWashiTape?: boolean;
  showPolaroid?: boolean;
  customFields?: CustomField[];
  /** Kaydedilmiş canvas konumları (admin’den sürükle-bırak); varsa kullanılır */
  canvasItems?: PlannerCanvasItem[];
}

/** Deterministik rastgele — aynı seed için aynı değer */
function seeded(seed: number, min: number, max: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

const WASHI_VARIANTS = ["pink", "blue", "mint", "gold", "beige"] as const;

/** Sağ sayfa — absolute katmanlar (sayfa konteynerına sabit, flip ile hareket eder) */
export function MessyNotesPage({
  monthName,
  summaries,
  onDayClick,
  images = [],
  paperclipImages = [],
  attachedImages = [],
  showWashiTape = true,
  showPolaroid = true,
  customFields = [],
  canvasItems = [],
}: MessyNotesPageProps) {
  const canvasMap = useMemo(() => {
    const m = new Map<string, { left: number; top: number; rotate: number; skew: number; zIndex: number }>();
    for (const it of canvasItems) {
      if (it.page !== "right") continue;
      m.set(`${it.item_kind}:${it.item_key}`, {
        left: it.x * 100,
        top: it.y * 100,
        rotate: it.rotation,
        skew: 0,
        zIndex: it.z_index,
      });
    }
    return m;
  }, [canvasItems]);

  const { polaroidTilts, polaroidSkews, washiRotates, attachedPositions, customFieldPositions, polaroidPositions } = useMemo(() => {
    const polaroidTilts = images.slice(0, 5).map((_, i) => seeded(i + 1, -5, 5));
    const polaroidSkews = images.slice(0, 5).map((_, i) => seeded(i + 2, -2, 2));
    const washiRotates = [12, -8, 18, -5, 22].map((v, i) => seeded(i + 10, -25, 25));
    const attachedListLen = (attachedImages.length ? attachedImages : paperclipImages.map((p) => ({ url: p.url, style: "standard_clip" as AttachmentStyle }))).slice(0, 4).length;
    const attachedPositions = Array.from({ length: attachedListLen }, (_, i) => {
      const saved = canvasMap.get(`attached_photo:${i}`);
      if (saved) return { left: saved.left, top: saved.top, rotate: saved.rotate, skew: 0, zIndex: saved.zIndex };
      return {
        left: 8 + (i % 2) * 42,
        top: 2 + Math.floor(i / 2) * 16,
        rotate: seeded(i + 30, -5, 5),
        skew: seeded(i + 31, -2, 2),
        zIndex: 50 + i,
      };
    });
    const customFieldPositions = customFields.map((_, i) => {
      const saved = canvasMap.get(`custom_field:${i}`);
      if (saved) return { left: saved.left, top: saved.top, rotate: saved.rotate, skew: saved.skew ?? 0, zIndex: saved.zIndex };
      return {
        left: 5 + (i % 3) * 35,
        top: 48 + Math.floor(i / 3) * 22,
        rotate: seeded(i + 40, -5, 5),
        skew: seeded(i + 41, -1.5, 1.5),
        zIndex: 6,
      };
    });
    const polaroidPositions = images.slice(0, 4).map((_, i) => {
      const saved = canvasMap.get(`polaroid:${i}`);
      if (saved) return { left: saved.left, top: saved.top, rotate: saved.rotate, zIndex: saved.zIndex, fromCanvas: true };
      return {
        right: 6 + i * 12,
        bottom: 10 + (i % 2) * 8,
        rotate: polaroidTilts[i] ?? 0,
        zIndex: 40 + i,
        fromCanvas: false,
      };
    });
    return { polaroidTilts, polaroidSkews, washiRotates, attachedPositions, customFieldPositions, polaroidPositions };
  }, [images, attachedImages, paperclipImages, customFields, canvasMap]);

  const attachedList = attachedImages.length
    ? attachedImages
    : paperclipImages.map((p) => ({ url: p.url, style: "standard_clip" as AttachmentStyle }));

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ transformStyle: "preserve-3d" }}>
      {/* Katman 1: Ataşlı görseller — sayfa üst kısmında, flip ile birlikte döner */}
      {attachedList.slice(0, 4).map((img, i) => {
        const pos = attachedPositions[i] ?? { left: 8, top: 2, rotate: 0, skew: 0, zIndex: 50 + i };
        return (
          <motion.div
            key={i}
            layout
            data-preserve-3d
            className="absolute"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              transform: `rotate(${pos.rotate}deg) skew(${pos.skew ?? 0}deg, ${(pos.skew ?? 0) * 0.5}deg)`,
              transformStyle: "preserve-3d",
              zIndex: pos.zIndex ?? 50 + i,
            }}
          >
            {/* Kağıtta ataş ezilmesi — hafif gölge */}
            <div
              className="pointer-events-none absolute -right-2 -top-2 rounded-full opacity-60"
              style={{
                width: 22,
                height: 12,
                background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,0,0,0.08) 0%, transparent 70%)",
                filter: "blur(1px)",
              }}
              aria-hidden
            />
            <div
              className="overflow-hidden rounded border border-black/10 bg-white"
              style={{
                width: 72,
                height: 56,
                boxShadow: "0 2px 8px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              <Image
                src={img.url}
                alt=""
                width={72}
                height={56}
                className="h-full w-full object-cover"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                sizes="72px"
              />
            </div>
            <div
              className="absolute -right-1.5 -top-1.5 z-[50]"
              style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25)) drop-shadow(0 0 0 1px rgba(0,0,0,0.04))" }}
            >
              <AttachmentSVG style={img.style} size={20} />
            </div>
            {showWashiTape && (
              <GlossyWashiTape
                className="absolute -top-0.5 -right-1 h-2.5 w-6 opacity-40"
                variant="beige"
                rotateDeg={washiRotates[i % washiRotates.length]}
                style={{ zIndex: 1 }}
              />
            )}
          </motion.div>
        );
      })}

      {/* Katman 2: İçerik — başlıklar Permanent Marker, notlar Caveat */}
      <div
        className="absolute inset-0 px-5 pb-5 pt-4 sm:px-6 sm:pb-6"
        style={{
          paddingTop: attachedList.length > 0 ? "24%" : "8%",
          zIndex: 5,
        }}
      >
        <h3 className="text-2xl font-semibold text-black/85 font-display">
          {monthName} — Notlar
        </h3>
      </div>

      {/* Katman 2b: Özel alanlar — dağınık düzen; her birine Metal Ataş veya Washi Tape */}
      {customFields.filter((f) => f.label || f.content).map((f, i) => {
        const pos = customFieldPositions[i] ?? { left: 5, top: 50, rotate: 0, skew: 0, zIndex: 6 };
        const accessory = (i % 3 === 0 ? "paperclip" : i % 3 === 1 ? "washi" : "paperclip") as "paperclip" | "washi";
        const accRotate = seeded(i + 60, -15, 15);
        const accCorner = i % 2 === 0 ? "tr" : "tl";
        return (
          <motion.div
            key={i}
            layout
            data-preserve-3d
            className="absolute overflow-visible rounded-lg border border-black/10 bg-white/60 px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.05)]"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              width: "min(38%, 200px)",
              transform: `rotate(${pos.rotate}deg) skew(${pos.skew ?? 0}deg, ${(pos.skew ?? 0) * 0.3}deg)`,
              transformOrigin: "top left",
              transformStyle: "preserve-3d",
              zIndex: pos.zIndex ?? 6,
            }}
          >
            <div
              className="pointer-events-none absolute z-[70]"
              style={{
                ...(accCorner === "tr"
                  ? { top: -8, right: -14, transform: `translateX(60%) rotate(${accRotate}deg)` }
                  : { top: -6, left: -16, transform: `translateX(-60%) rotate(${accRotate}deg)` }),
                filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.28)) drop-shadow(0 0 0 1px rgba(0,0,0,0.05))",
              }}
            >
              {accessory === "paperclip" ? (
                <AttachmentSVG style="standard_clip" size={28} />
              ) : (
                <div style={{ width: 40, height: 18 }}>
                  <GlossyWashiTape variant={WASHI_VARIANTS[(i + 2) % WASHI_VARIANTS.length]} rotateDeg={accRotate} className="h-full w-full opacity-95" />
                </div>
              )}
            </div>
            {f.label && (
              <h4 className="text-sm font-semibold text-black/80 font-display">
                {f.label}
              </h4>
            )}
            {f.content && (
              <p className="mt-0.5 whitespace-pre-wrap text-xs text-black/75 line-clamp-3 font-sans">{f.content}</p>
            )}
          </motion.div>
        );
      })}

      {/* Katman 3: Polaroid — absolute, beyaz çerçeve; konum canvas’tan veya varsayılan */}
      {showPolaroid &&
        images.slice(0, 4).map((img, i) => {
          const pos = polaroidPositions[i];
          const style = pos?.fromCanvas
            ? { left: `${pos.left}%`, top: `${pos.top}%`, transform: `rotate(${pos.rotate}deg)`, transformStyle: "preserve-3d" as const, zIndex: pos.zIndex }
            : { right: `${pos?.right ?? 6 + i * 12}%`, bottom: `${pos?.bottom ?? 10 + (i % 2) * 8}%`, transform: `rotate(${pos?.rotate ?? 0}deg)`, transformStyle: "preserve-3d" as const, zIndex: pos?.zIndex ?? 40 + i };
          return (
          <motion.div
            key={i}
            layout
            data-preserve-3d
            className="absolute"
            style={style}
          >
            <PolaroidFrame
              src={img.url}
              showWashi={showWashiTape}
              washiRotate={washiRotates[i + 2] ?? 15}
              washiVariant={WASHI_VARIANTS[i % WASHI_VARIANTS.length]}
            />
          </motion.div>
          );
        })}
    </div>
  );
}

function PolaroidFrame({
  src,
  showWashi = false,
  washiRotate = 15,
  washiVariant = "beige",
}: {
  src: string;
  showWashi?: boolean;
  washiRotate?: number;
  washiVariant?: "pink" | "blue" | "mint" | "gold" | "beige";
}) {
  return (
    <div
      className="relative overflow-hidden bg-white shadow-[0_4px_14px_rgba(0,0,0,0.2),0_2px_6px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]"
      style={{
        width: 74,
        padding: "8px 8px 24px 8px",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {showWashi && (
        <GlossyWashiTape
          className="absolute -top-0.5 -right-1.5 h-2.5 w-7 opacity-40"
          variant={washiVariant}
          rotateDeg={washiRotate}
          style={{ zIndex: 2 }}
        />
      )}
      <div className="relative h-16 w-full overflow-hidden rounded-sm">
        <Image
          src={src}
          alt=""
          width={74}
          height={64}
          className="h-full w-full object-cover"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          sizes="74px"
        />
      </div>
    </div>
  );
}
