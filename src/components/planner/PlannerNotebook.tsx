"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Image, Video, Link2, Film } from "lucide-react";
import { fetchDayEntries, fetchMonthEntries } from "@/app/planner/actions";
import type { PlannerEntryWithMedia } from "@/lib/db/queries";
import { getVideoEmbedUrl } from "@/lib/utils/embed";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function CalendarGrid({
  year,
  month,
  onDayClick,
}: {
  year: number;
  month: number;
  onDayClick: (dateStr: string) => void;
}) {
  const days = getDaysInMonth(year, month);
  const startDow = new Date(year, month, 1).getDay();

  const cells = [];
  for (let i = 0; i < startDow; i++) {
    cells.push(<div key={`pad-${i}`} />);
  }
  for (let d = 1; d <= days; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push(
      <button
        key={d}
        onClick={() => onDayClick(dateStr)}
        className="rounded py-1.5 text-xs text-[var(--foreground)] transition hover:border-[var(--accent)]/50 hover:bg-[var(--accent-soft)]/30"
      >
        {d}
      </button>
    );
  }

  return (
    <div className="flex h-full flex-col p-3">
      <h3 className="font-editorial text-sm font-medium text-[var(--foreground)]">
        {MONTH_NAMES[month]} {year}
      </h3>
      <div className="mt-2 grid flex-1 grid-cols-7 gap-0.5 text-[10px]">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d} className="py-0.5 text-center font-medium text-[var(--muted)]">
            {d}
          </div>
        ))}
        {cells}
      </div>
    </div>
  );
}

function HighlightsList({
  entries,
  onDayClick,
}: {
  entries: PlannerEntryWithMedia[];
  onDayClick: (dateStr: string) => void;
}) {
  if (entries.length === 0) {
    return (
      <p className="p-4 text-xs text-[var(--muted)]">No entries this month.</p>
    );
  }
  return (
    <ul className="space-y-2 overflow-auto p-3">
      {entries.map((e) => {
        const day = e.date.split("-")[2];
        const mediaCount = e.media.length;
        return (
          <li key={e.id}>
            <button
              onClick={() => onDayClick(e.date)}
              className="w-full text-left rounded border border-transparent px-2 py-1.5 text-xs transition hover:border-[var(--accent)]/30 hover:bg-[var(--accent-soft)]/20"
            >
              <span className="font-medium text-[var(--muted)]">{day}</span>
              <span className="mx-2">—</span>
              <span className="text-[var(--foreground)] line-clamp-1">
                {e.title || "(Untitled)"}
              </span>
              {mediaCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-0.5 text-[var(--muted)]">
                  {e.media.some((m) => getVideoEmbedUrl(m.url)) && (
                    <Film className="h-3 w-3" />
                  )}
                  {e.media.some((m) => m.kind === "image") && (
                    <Image className="h-3 w-3" />
                  )}
                  {e.media.some((m) => m.kind === "video") && (
                    <Video className="h-3 w-3" />
                  )}
                  {e.media.some((m) => m.kind === "link") && (
                    <Link2 className="h-3 w-3" />
                  )}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function MonthSpread({
  year,
  month,
  entries,
  onDayClick,
}: {
  year: number;
  month: number;
  entries: PlannerEntryWithMedia[];
  onDayClick: (dateStr: string) => void;
}) {
  return (
    <div className="flex h-full w-full">
      {/* Left page: calendar */}
      <div className="w-1/2 border-r border-[var(--card-border)] bg-[#fdfbf7]">
        <CalendarGrid year={year} month={month} onDayClick={onDayClick} />
      </div>
      {/* Right page: highlights */}
      <div className="w-1/2 bg-[#fdfbf7]">
        <h3 className="border-b border-[var(--card-border)] px-3 py-2 font-editorial text-xs font-medium text-[var(--muted)]">
          {MONTH_NAMES[month]} — Entries
        </h3>
        <HighlightsList entries={entries} onDayClick={onDayClick} />
      </div>
    </div>
  );
}

function DayModal({
  dateStr,
  entries,
  onClose,
}: {
  dateStr: string;
  entries: PlannerEntryWithMedia[];
  onClose: () => void;
}) {
  const [d, m, y] = dateStr.split("-");
  const display = `${Number(d)} ${MONTH_NAMES[Number(m) - 1]} ${y}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] w-full max-w-md overflow-auto rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--card-border)] bg-[var(--card)] px-4 py-3">
          <h3 className="font-editorial font-medium">Daily Journal — {display}</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-4">
          {entries.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No entries for this day.</p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-[var(--card-border)] p-3"
              >
                {entry.title && (
                  <p className="font-medium text-[var(--foreground)]">{entry.title}</p>
                )}
                {entry.body && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--muted)]">
                    {entry.body}
                  </p>
                )}
                {entry.media.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.media.map((m) => {
                      const embedUrl = getVideoEmbedUrl(m.url);
                      if (embedUrl) {
                        return (
                          <div
                            key={m.id}
                            className="aspect-video max-h-32 w-full overflow-hidden rounded"
                          >
                            <iframe
                              src={embedUrl}
                              title={m.caption ?? ""}
                              className="h-full w-full"
                              allowFullScreen
                            />
                          </div>
                        );
                      }
                      if (m.kind === "image") {
                        return (
                          <img
                            key={m.id}
                            src={m.url}
                            alt={m.caption ?? ""}
                            className="max-h-32 rounded object-cover"
                          />
                        );
                      }
                      if (m.kind === "video") {
                        return (
                          <video
                            key={m.id}
                            src={m.url}
                            controls
                            className="max-h-32 rounded"
                          />
                        );
                      }
                      return (
                        <a
                          key={m.id}
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[var(--accent)] hover:underline"
                        >
                          {m.caption || "Link"}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function PlannerNotebook() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());
  const [entriesCache, setEntriesCache] = useState<Record<string, PlannerEntryWithMedia[]>>({});
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [modalEntries, setModalEntries] = useState<PlannerEntryWithMedia[]>([]);
  const bookRef = useRef<{ pageFlip: () => { flipPrev: () => void; flipNext: () => void; flipPage: (n: number) => void } }>(null);

  const currentSpread = monthIndex;

  useEffect(() => {
    const key = `${year}-${monthIndex}`;
    fetchMonthEntries(year, monthIndex).then((data) =>
      setEntriesCache((c) => ({ ...c, [key]: data }))
    );
  }, [year, monthIndex]);

  const handleDayClick = useCallback(async (dateStr: string) => {
    const data = await fetchDayEntries(dateStr);
    setModalEntries(data);
    setModalDate(dateStr);
  }, []);

  const goPrev = useCallback(() => {
    if (monthIndex <= 0) {
      setMonthIndex(11);
      setYear((y) => y - 1);
    } else {
      setMonthIndex((m) => m - 1);
    }
    bookRef.current?.pageFlip()?.flipPrev?.();
  }, [monthIndex]);

  const goNext = useCallback(() => {
    if (monthIndex >= 11) {
      setMonthIndex(0);
      setYear((y) => y + 1);
    } else {
      setMonthIndex((m) => m + 1);
    }
    bookRef.current?.pageFlip()?.flipNext?.();
  }, [monthIndex]);

  const goToMonth = useCallback((m: number) => {
    setMonthIndex(m);
    const flip = bookRef.current?.pageFlip?.();
    const fp = flip as { flip?: (p: number, c: string) => void };
    if (fp?.flip) fp.flip(m, "top");
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {/* Month selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={goPrev}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <select
          value={monthIndex}
          onChange={(e) => goToMonth(Number(e.target.value))}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-sm"
        >
          {MONTH_NAMES.map((name, i) => (
            <option key={i} value={i}>
              {name} {year}
            </option>
          ))}
        </select>
        <button
          onClick={goNext}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Notebook */}
      <div
        className="overflow-hidden rounded-lg shadow-2xl"
        style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
      >
        <HTMLFlipBook
          ref={bookRef}
          width={520}
          height={440}
          size="fixed"
          minWidth={400}
          maxWidth={560}
          minHeight={360}
          maxHeight={500}
          startPage={monthIndex}
          drawShadow={true}
          flippingTime={400}
          usePortrait={false}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={0.5}
          showCover={false}
          mobileScrollSupport
          clickEventForward
          useMouseEvents
          swipeDistance={30}
          showPageCorners
          disableFlipByClick={false}
          onFlip={(e: { data: number }) => setMonthIndex(e.data)}
          className="notebook-book"
          style={{}}
        >
          {Array.from({ length: 12 }, (_, m) => (
            <div
              key={m}
              className="notebook-spread"
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#fdfbf7",
                border: "1px solid var(--card-border)",
                boxSizing: "border-box",
              }}
            >
              <MonthSpread
                year={year}
                month={m}
                entries={entriesCache[`${year}-${m}`] ?? []}
                onDayClick={handleDayClick}
              />
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      <span className="text-sm text-[var(--muted)]">
        {MONTH_NAMES[monthIndex]} {year}
      </span>

      <AnimatePresence>
        {modalDate && (
          <DayModal
            dateStr={modalDate}
            entries={modalEntries}
            onClose={() => {
              setModalDate(null);
              setModalEntries([]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
