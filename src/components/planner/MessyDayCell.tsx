"use client";

import { cn } from "@/lib/utils";
import type { PlannerDaySummary } from "@/lib/planner";
import { SmudgeOverlay } from "./SmudgeOverlay";
import { AttachmentSVG } from "./AttachmentSVG";
import { GlossyWashiTape } from "./GlossyWashiTape";

function isTodayCell(dateStr: string): boolean {
  if (!dateStr) return false;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return dateStr === todayStr;
}

/** Deterministik rastgele -3..3 derece — el yapımı havası */
function seededRotate(seed: number, min: number, max: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

interface MessyDayCellProps {
  day: number | null;
  summary: PlannerDaySummary | null;
  onDayClick: (dateStr: string, monthName: string, day: number) => void;
  dateStr: string;
  monthName: string;
}

/** El çizimi daire, polaroid önizlemeler, özet cümle, yoğun gün doodle */
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
  const imageUrls = summary?.imageUrls ?? [];
  const attachedImages = summary?.attachedImages ?? [];
  const summaryQuote = summary?.summaryQuote;
  const smudge = summary?.smudge;
  const hasPaperclip = attachedImages.length > 0;

  return (
    <button
      type="button"
      className={cn(
        "messy-day-cell relative flex min-h-[56px] flex-col rounded-md border border-black/8 bg-white/30 p-1 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:bg-white/60 hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]",
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

      {/* El çizimi daire — giriş varsa (daire içine alma) */}
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

      {/* Yoğun gün — kutucuğun etrafına daire içine alma (doodle) */}
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

      {/* Admin'den yüklenen fotoğraflar — rotate(-3..3deg) ile el yapımı havası, ataş + washi */}
      {imageUrls.length > 0 && (
        <div
          className="absolute bottom-0 right-0 flex items-end justify-end"
          style={{ zIndex: 1, width: "88%", height: "78%" }}
        >
          {imageUrls.slice(0, 4).map((url, i) => {
            const rot = seededRotate(day * 7 + i, -3, 3);
            const showClip = hasPaperclip && i === 0;
            const clipStyle = attachedImages[0]?.style ?? "standard_clip";
            return (
              <div
                key={i}
                className="relative overflow-hidden rounded-sm border border-black/12 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
                style={{
                  width: 26 - i * 2,
                  height: 22 - i * 1.5,
                  right: i * 5,
                  bottom: i * 4,
                  transform: `rotate(${rot}deg) skew(${i % 2 === 0 ? -1.5 : 1.5}deg, ${i % 2 === 0 ? 0.5 : -0.5}deg)`,
                }}
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
                {showClip && (
                  <div className="absolute -right-0.5 -top-0.5 z-[50]" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.2))" }}>
                    <AttachmentSVG style={clipStyle} size={12} />
                  </div>
                )}
                <GlossyWashiTape
                  className="absolute -top-0.5 -right-0.5 h-1.5 w-4 opacity-40"
                  variant="beige"
                  rotateDeg={seededRotate(day + i * 11, -15, 15)}
                  style={{ zIndex: 2 }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Yazıyı Dağıt — leke/parmak izi overlay (flip ile birlikte hareket eder) */}
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

      {/* Özet cümle (summary_quote) — kurşun kalem + mürekkep efekti */}
      {summaryQuote && (
        <p
          className="absolute bottom-0 left-0.5 right-0.5 line-clamp-2 leading-tight -skew-x-1"
          style={{
            fontFamily: "var(--font-handwriting), cursive",
            fontSize: "6px",
            zIndex: 2,
            color: "rgba(90,85,75,0.52)",
            textShadow: "0 0 1px rgba(140,130,110,0.12), 0 1px 1px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.02)",
            fontStyle: "italic",
            letterSpacing: "0.02em",
            filter: "blur(0.2px)",
            opacity: 0.9,
          }}
        >
          {summaryQuote}
        </p>
      )}
    </button>
  );
}
