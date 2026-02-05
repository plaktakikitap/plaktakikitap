"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PlannerDaySummary } from "@/lib/planner";
import { SmudgeOverlay } from "./SmudgeOverlay";

const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUG/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQACEQADAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8Q/9k=";

function isTodayCell(dateStr: string): boolean {
  if (!dateStr) return false;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return dateStr === todayStr;
}

/** Minik sticker ikonu — entry varsa gösterilir */
function StickerChip() {
  return (
    <span
      className="absolute right-0.5 top-0.5 text-[10px] opacity-80"
      style={{ zIndex: 3 }}
      aria-hidden
    >
      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor">
        <path d="M6 1L7.2 4.4L11 5L8 7.7L8.8 11L6 9.2L3.2 11L4 7.7L1 5L4.8 4.4L6 1Z" />
      </svg>
    </span>
  );
}

interface MessyDayCellProps {
  day: number | null;
  summary: PlannerDaySummary | null;
  onDayClick: (dateStr: string, monthName: string, day: number) => void;
  dateStr: string;
  monthName: string;
}

/** Gün hücresi: preview chips (1 polaroid thumbnail, 1–2 satır soluk metin, minik sticker ikonu). Tıklanınca Journal Modal açılır. */
export function MessyDayCell({
  day,
  summary,
  onDayClick,
  dateStr,
  monthName,
}: MessyDayCellProps) {
  if (!day) {
    return <div className="min-h-[56px]" />;
  }

  const hasEntry = !!summary && summary.entryCount > 0;
  const today = isTodayCell(dateStr);
  const isBusy = !!summary?.isBusy;
  const firstImageUrl = summary?.firstImageUrl ?? summary?.imageUrls?.[0];
  const smudge = summary?.smudge;
  const textPreview = summary?.summaryQuote ?? summary?.firstEntryTitle ?? summary?.firstEntryContent ?? null;

  return (
    <button
      type="button"
      className={cn(
        "messy-day-cell relative flex min-h-[56px] flex-col overflow-visible rounded-md border border-black/8 bg-white/30 p-1 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:bg-white/60 hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]",
        today && "today",
        hasEntry && "ring-1 ring-amber-900/20",
        isBusy && "ring-1 ring-amber-600/30"
      )}
      style={{
        transformStyle: "preserve-3d",
        transform: `skewX(${day % 5 === 0 ? -0.5 : day % 5 === 2 ? 0.5 : 0}deg)`,
      }}
      onClick={() => onDayClick(dateStr, monthName, day)}
      aria-label={`${day} ${monthName}`}
    >
      <div className="relative z-[2] flex justify-end">
        <span
          className="text-xs font-semibold text-black/75"
          style={{ fontFamily: "var(--font-handwriting), cursive", filter: "blur(0.2px)", opacity: 0.9 }}
        >
          {day}
        </span>
      </div>

      {/* Sticker / entry göstergesi — minik ikon */}
      {hasEntry && <StickerChip />}

      {/* El çizimi daire — giriş varsa */}
      {hasEntry && !isBusy && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 0 }}
        >
          <svg
            viewBox="0 0 40 40"
            className="h-[70%] w-[70%] opacity-30"
            style={{ transform: `rotate(${day % 3 === 0 ? -1.5 : day % 3 === 1 ? 2 : -3}deg)` }}
          >
            <ellipse
              cx="20"
              cy="20"
              rx="15.5"
              ry="16.5"
              fill="none"
              stroke="rgba(100,75,50,0.55)"
              strokeWidth="1.4"
              strokeDasharray="2.5 1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {hasEntry && isBusy && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 0 }}
        >
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full opacity-40"
            style={{ transform: `rotate(${day % 3 === 0 ? -2 : day % 3 === 1 ? 3 : -4}deg)` }}
          >
            <ellipse
              cx="50"
              cy="50"
              rx="46"
              ry="48"
              fill="none"
              stroke="rgba(100,75,50,0.45)"
              strokeWidth="1.2"
              strokeDasharray="3 2 1 2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Preview: 1 küçük polaroid thumbnail, 45deg rotate, köşeden taşabilir */}
      {hasEntry && firstImageUrl && (
        <div
          className="absolute -bottom-0.5 -right-0.5 overflow-hidden rounded-sm bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1)]"
          style={{
            zIndex: 1,
            width: 28,
            padding: "2px 2px 8px 2px",
            border: "1px solid rgba(0,0,0,0.08)",
            transform: "rotate(45deg)",
          }}
        >
          <div className="relative h-5 w-6 overflow-hidden rounded-[1px]">
            <Image
              src={firstImageUrl}
              alt=""
              width={28}
              height={24}
              className="h-full w-full object-cover"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              sizes="28px"
            />
          </div>
        </div>
      )}

      {/* Preview: 1–2 satır çok soluk metin (text-xs, opacity 0.55) */}
      {hasEntry && textPreview && (
        <p
          className="messy-ink-bleed absolute bottom-0.5 left-0.5 right-0.5 line-clamp-2 leading-tight text-xs -skew-x-0.5"
          style={{
            fontFamily: "var(--font-handwriting), cursive",
            zIndex: 2,
            color: "rgba(60,55,50,0.85)",
            opacity: 0.55,
            filter: "blur(0.15px)",
          }}
        >
          {textPreview}
        </p>
      )}

      {smudge?.preset && (
        <SmudgeOverlay
          preset={smudge.preset}
          x={smudge.x ?? 0.3}
          y={smudge.y ?? 0.5}
          rotation={smudge.rotation ?? 0}
          opacity={smudge.opacity ?? 0.15}
          style={{ width: 36, height: 28, zIndex: 1 }}
        />
      )}
    </button>
  );
}
