"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { playSound, AUDIO } from "@/lib/audio";
import { MessyBookShell } from "./MessyBookShell";
import { MessyPaperPage } from "./MessyPaperPage";
import { MessyCalendarGrid } from "./MessyCalendarGrid";
import { MessyNotesPage } from "./MessyNotesPage";
import { DayJournalModal } from "./DayJournalModal";
import type { DaySmudge } from "@/lib/planner";
import type { PlannerDaySummary, PlannerEntryWithMedia } from "@/lib/planner";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

const MONTH_LABELS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const PAPER_BG = "#ebe4d4";

export default function MessyBulletJournal() {
  const year = 2026;
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth() % 12);
  const [summaryCache, setSummaryCache] = useState<
    Record<string, PlannerDaySummary[]>
  >({});
  const [selectedDay, setSelectedDay] = useState<{
    dateStr: string;
    monthName: string;
    day: number;
  } | null>(null);
  const [modalEntries, setModalEntries] = useState<PlannerEntryWithMedia[]>([]);
  const [modalSmudge, setModalSmudge] = useState<DaySmudge | null | undefined>(undefined);
  const [modalLoading, setModalLoading] = useState(false);

  const startPage = monthIndex * 2;
  const lastFlipTime = useRef(0);
  const [flipInProgress, setFlipInProgress] = useState(false);

  const handleChangeState = useCallback((e: { data: string }) => {
    setFlipInProgress(e.data === "flipping");
  }, []);

  const handleFlip = useCallback((e: { data: number }) => {
    const newIdx = Math.floor(e.data / 2);
    const prevIdx = monthIndex;
    setMonthIndex(newIdx);
    const now = Date.now();
    if (now - lastFlipTime.current > 150) {
      lastFlipTime.current = now;
      const pitch = 0.95 + Math.random() * 0.1;
      playSound(AUDIO.paperFlip, { volume: 0.5, playbackRate: pitch });
      const prevSummaries = summaryCache[`${year}-${prevIdx}`] ?? [];
      const newSummaries = summaryCache[`${year}-${newIdx}`] ?? [];
      const hasAttachments = [prevSummaries, newSummaries].some((summaries) =>
        summaries.some((s) => (s.attachedImages?.length ?? 0) > 0 || (s.paperclipImageUrls?.length ?? 0) > 0)
      );
      if (hasAttachments) {
        setTimeout(() => playSound(AUDIO.metallicClick, { volume: 0.22, playbackRate: 1.05 }), 120);
      }
    }
  }, [monthIndex, summaryCache, year]);

  const [pageSettings, setPageSettings] = useState<Record<string, {
    show_coffee_stain: boolean;
    show_washi_tape: boolean;
    show_polaroid: boolean;
    show_curled_corner: boolean;
    custom_fields?: { label: string; content: string }[];
  }>>({});

  useEffect(() => {
    const defaults = {
      show_coffee_stain: true,
      show_washi_tape: true,
      show_polaroid: true,
      show_curled_corner: true,
      custom_fields: [] as { label: string; content: string }[],
    };
    Array.from({ length: 12 }, (_, m) => m).forEach((monthIdx) => {
      const key = `${year}-${monthIdx}`;
      fetch(`/api/planner/settings?year=${year}&month=${monthIdx + 1}`)
        .then((r) => r.json())
        .then((data) =>
          setPageSettings((prev) => ({
            ...prev,
            [key]: {
              show_coffee_stain: data.show_coffee_stain ?? true,
              show_washi_tape: data.show_washi_tape ?? true,
              show_polaroid: data.show_polaroid ?? true,
              show_curled_corner: data.show_curled_corner ?? true,
              custom_fields: Array.isArray(data.custom_fields) ? data.custom_fields : [],
            },
          }))
        )
        .catch(() =>
          setPageSettings((prev) => ({ ...prev, [key]: defaults }))
        );
    });
  }, [year]);

  useEffect(() => {
    Array.from({ length: 12 }, (_, m) => m).forEach((m) => {
      const key = `${year}-${m}`;
      fetch(`/api/planner/entries?year=${year}&month=${m}`)
        .then((r) => r.json())
        .then((data) =>
          setSummaryCache((prev) => ({ ...prev, [key]: data ?? [] }))
        )
        .catch(() =>
          setSummaryCache((prev) => ({ ...prev, [key]: [] }))
        );
    });
  }, [year]);

  const summaryByDateFor = useCallback(
    (m: number) => {
      const arr = summaryCache[`${year}-${m}`] ?? [];
      const out: Record<string, PlannerDaySummary> = {};
      for (const s of arr) out[s.date] = s;
      return out;
    },
    [summaryCache, year]
  );

  async function handleDayClick(
    dateStr: string,
    monthName: string,
    day: number
  ) {
    setSelectedDay({ dateStr, monthName, day });
    setModalLoading(true);
    setModalEntries([]);
    setModalSmudge(undefined);
    try {
      const [entriesRes, smudgeRes] = await Promise.all([
        fetch(`/api/planner/entries/${dateStr}`),
        fetch(`/api/planner/smudge/${dateStr}`),
      ]);
      const entriesData = await entriesRes.json();
      const smudgeData = await smudgeRes.json();
      setModalEntries(Array.isArray(entriesData) ? entriesData : []);
      setModalSmudge(smudgeData?.preset ? smudgeData : null);
    } catch {
      setModalEntries([]);
      setModalSmudge(null);
    } finally {
      setModalLoading(false);
    }
  }

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        key: `${year}-${i}`,
        label: MONTH_LABELS[i],
        year,
        index: i,
      })),
    [year]
  );

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="mb-6 -skew-x-1">
        <h2
          className="text-2xl font-semibold tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          style={{ fontFamily: "var(--font-handwriting-title), cursive" }}
        >
          Bullet Journal
        </h2>
      </div>

      <MessyBookShell monthIndex={monthIndex} flipInProgress={flipInProgress}>
        <div className="relative overflow-hidden rounded-2xl" data-flipping={flipInProgress}>
          <HTMLFlipBook
            width={560}
            height={680}
            size="fixed"
            startZIndex={0}
            autoSize={false}
            minWidth={360}
            maxWidth={560}
            minHeight={460}
            maxHeight={680}
            usePortrait={false}
            showCover={false}
            mobileScrollSupport
            maxShadowOpacity={0.35}
            drawShadow
            flippingTime={650}
            startPage={startPage}
            clickEventForward
            useMouseEvents
            swipeDistance={30}
            showPageCorners
            disableFlipByClick={false}
            onFlip={handleFlip}
            onChangeState={handleChangeState}
            className="bg-transparent ajanda-flipbook"
            style={{}}
          >
            {months.flatMap((m) => [
              <div
                key={`${m.key}-cal`}
                className="relative h-full w-full overflow-hidden rounded-r-none"
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: PAPER_BG,
                  boxSizing: "border-box",
                  transformStyle: "preserve-3d",
                }}
              >
                <MessyPaperPage
                  side="left"
                  showCurledCorner={pageSettings[`${year}-${m.index}`]?.show_curled_corner ?? true}
                  showCoffeeStain={pageSettings[`${year}-${m.index}`]?.show_coffee_stain ?? true}
                >
                  <MessyCalendarGrid
                    year={year}
                    monthIndex={m.index}
                    summaryByDate={summaryByDateFor(m.index)}
                    onDayClick={handleDayClick}
                  />
                </MessyPaperPage>
              </div>,
              <div
                key={`${m.key}-notes`}
                className="relative h-full w-full overflow-hidden rounded-l-none"
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: PAPER_BG,
                  boxSizing: "border-box",
                  transformStyle: "preserve-3d",
                }}
              >
                <MessyPaperPage
                  side="right"
                  showCurledCorner={pageSettings[`${year}-${m.index}`]?.show_curled_corner ?? true}
                  showCoffeeStain={pageSettings[`${year}-${m.index}`]?.show_coffee_stain ?? true}
                >
                  <MessyNotesPage
                    monthName={m.label}
                    summaries={summaryCache[`${year}-${m.index}`] ?? []}
                    onDayClick={handleDayClick}
                    images={
                      (summaryCache[`${year}-${m.index}`] ?? [])
                        .filter((s) => s.firstImageUrl)
                        .map((s) => ({ url: s.firstImageUrl!, dateStr: s.date }))
                    }
                    paperclipImages={
                      (summaryCache[`${year}-${m.index}`] ?? [])
                        .flatMap((s) =>
                          (s.paperclipImageUrls ?? []).map((url) => ({ url, dateStr: s.date }))
                        )
                    }
                    attachedImages={
                      (summaryCache[`${year}-${m.index}`] ?? []).flatMap((s) => s.attachedImages ?? [])
                    }
                    showWashiTape={pageSettings[`${year}-${m.index}`]?.show_washi_tape ?? true}
                    showPolaroid={pageSettings[`${year}-${m.index}`]?.show_polaroid ?? true}
                    customFields={pageSettings[`${year}-${m.index}`]?.custom_fields ?? []}
                  />
                </MessyPaperPage>
              </div>,
            ])}
          </HTMLFlipBook>
        </div>
      </MessyBookShell>

      <AnimatePresence>
        {selectedDay && (
          <DayJournalModal
            key={selectedDay.dateStr}
            day={selectedDay.day}
            monthName={selectedDay.monthName}
            year={year}
            entries={modalLoading ? [] : modalEntries}
            smudge={modalSmudge}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
