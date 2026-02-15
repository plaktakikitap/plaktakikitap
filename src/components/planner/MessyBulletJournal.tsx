"use client";

/**
 * Bullet journal: sayfa çevirme react-pageflip (HTMLFlipBook) ile; ses public/sfx/page-turn.mp3.
 * framer-motion yalnızca modal (AnimatePresence) ve küçük intro/hover animasyonları için.
 * Spread mantığı: her flip "sayfa" tek fiziksel sayfa; 2 sayfa = 1 spread (sol + sağ).
 */
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { playSound, AUDIO } from "@/lib/audio";
import { BulletJournalBook, BOOK_PAGE_HEIGHT, BOOK_PAGE_WIDTH } from "./BulletJournalBook";
import { FrontCover } from "./covers/FrontCover";
import { BackCover } from "./covers/BackCover";
import { MessyPaperPage } from "./MessyPaperPage";
import { MessyCalendarGrid } from "./MessyCalendarGrid";
import { MessyNotesPage } from "./MessyNotesPage";
import { MessyElementsOverlay } from "./MessyElementsOverlay";
import { ItemLayer } from "./ItemLayer";
import { DayJournalModal } from "./DayJournalModal";
import type { DaySmudge, PlannerCanvasItem, PlannerDaySummary, PlannerEntryWithMedia } from "@/lib/planner";
import type { MessyElement } from "@/types/messy-elements";
import type { PlannerItem } from "@/types/planner-items";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

const MONTH_LABELS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const PAPER_BG = "#fdfaf3";

/** Varsayılan overlay: sol sayfa (takvim) — ataş, washi, kahve lekesi */
const DEFAULT_LEFT_OVERLAY: MessyElement[] = [
  { type: "paperclip", x: 0.06, y: 0.2, rotation: 8, zIndex: 50, size: 26 },
  { type: "paperclip", x: 0.94, y: 0.75, rotation: -6, zIndex: 48, size: 22 },
  { type: "washi_tape", x: 0.04, y: 0.12, rotation: -12, zIndex: 45 },
  { type: "coffee_stain", x: 0.86, y: 0.82, rotation: -3, zIndex: 5, size: 52 },
];
/** Varsayılan overlay: sağ sayfa (notlar) — post-it, bant, ataş, kahve lekesi */
const DEFAULT_RIGHT_OVERLAY: MessyElement[] = [
  { type: "sticky_note", x: 0.75, y: 0.22, rotation: -5, zIndex: 32, text: "Notlar", color: "#fef08a" },
  { type: "washi_tape", x: 0.94, y: 0.08, rotation: -8, zIndex: 28, width: 36, height: 12 },
  { type: "paperclip", x: 0.92, y: 0.38, rotation: 12, zIndex: 50, size: 24 },
  { type: "coffee_stain", x: 0.1, y: 0.15, rotation: 4, zIndex: 5, size: 44 },
];

export default function MessyBulletJournal() {
  const year = new Date().getFullYear();
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

  /* Kapak yok: 0=Ocak takvim, 1=Ocak notlar, 2=Şubat takvim, 3=Şubat notlar, ... — her ay takvim+notlar yan yana */
  const startPage = monthIndex * 2;
  const lastFlipTime = useRef(0);
  const [flipInProgress, setFlipInProgress] = useState(false);
  const flipbookContainerRef = useRef<HTMLDivElement>(null);
  const pageSize = { width: BOOK_PAGE_WIDTH, height: BOOK_PAGE_HEIGHT };

  const lastFlipStateRef = useRef<string | null>(null);
  const handleChangeState = useCallback((e: { data: string }) => {
    const prev = lastFlipStateRef.current;
    lastFlipStateRef.current = e.data;
    setFlipInProgress(e.data === "flipping");
    /* Sayfa çevirme başladığı anda page-turn.mp3 tetikle */
    if (e.data === "flipping" && prev !== "flipping") {
      const pitch = 0.95 + Math.random() * 0.1;
      playSound(AUDIO.paperFlip, { volume: 0.4, playbackRate: pitch });
    }
  }, []);

  const handleFlip = useCallback((e: { data: number }) => {
    const pageIdx = e.data;
    const newIdx = Math.max(0, Math.min(11, Math.floor(pageIdx / 2)));
    const prevIdx = monthIndex;
    setMonthIndex(newIdx);
    const now = Date.now();
    /* Ataşlı sayfalarda kısa metallic click (çift tetiklemeyi önlemek için throttle) */
    if (now - lastFlipTime.current > 180) {
      lastFlipTime.current = now;
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
  const [canvasByMonth, setCanvasByMonth] = useState<Record<string, PlannerCanvasItem[]>>({});
  const [plannerItemsByMonth, setPlannerItemsByMonth] = useState<Record<string, PlannerItem[]>>({});

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

  useEffect(() => {
    Array.from({ length: 12 }, (_, m) => m).forEach((monthIdx) => {
      const key = `${year}-${monthIdx}`;
      fetch(`/api/planner/canvas?year=${year}&month=${monthIdx + 1}`)
        .then((r) => r.json())
        .then((data) =>
          setCanvasByMonth((prev) => ({ ...prev, [key]: Array.isArray(data) ? data : [] }))
        )
        .catch(() =>
          setCanvasByMonth((prev) => ({ ...prev, [key]: [] }))
        );
    });
  }, [year]);

  useEffect(() => {
    Array.from({ length: 12 }, (_, monthIdx) => {
      const key = `${year}-${monthIdx}`;
      fetch(`/api/planner/items?year=${year}&month=${monthIdx + 1}`)
        .then((r) => r.json())
        .then((data) =>
          setPlannerItemsByMonth((prev) => ({
            ...prev,
            [key]: Array.isArray(data) ? data : [],
          }))
        )
        .catch(() =>
          setPlannerItemsByMonth((prev) => ({ ...prev, [key]: [] }))
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
    <section className="mx-auto w-full max-w-[2260px] px-2 pb-24 sm:px-6" style={{ minHeight: "min(95vh, 1200px)" }}>
      <BulletJournalBook>
        <div
          ref={flipbookContainerRef}
          className="relative h-full w-full overflow-hidden rounded-lg"
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#fdfaf3",
            perspective: "2200px",
            transformStyle: "preserve-3d",
          }}
          data-flipping={flipInProgress}
        >
          <HTMLFlipBook
            width={pageSize.width}
            height={pageSize.height}
            size="fixed"
            style={{}}
            startZIndex={0}
            autoSize={false}
            minWidth={BOOK_PAGE_WIDTH}
            maxWidth={BOOK_PAGE_WIDTH}
            minHeight={BOOK_PAGE_HEIGHT}
            maxHeight={BOOK_PAGE_HEIGHT}
            usePortrait={false}
            showCover={false}
            mobileScrollSupport
            maxShadowOpacity={0.4}
            drawShadow
            flippingTime={650}
            startPage={startPage}
            clickEventForward
            useMouseEvents
            swipeDistance={25}
            showPageCorners
            disableFlipByClick={false}
            onFlip={handleFlip}
            onChangeState={handleChangeState}
            className="bg-transparent ajanda-flipbook"
          >
            {/* 0–1 Ocak, 2–3 Şubat, ... — her ay takvim (sol) + notlar (sağ) yan yana */}
            {months.flatMap((m) => [
              <div
                key={`${m.key}-cal`}
                className="relative h-full w-full overflow-visible rounded-r-none"
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: PAPER_BG,
                  boxSizing: "border-box",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="absolute inset-0 overflow-visible rounded-r-none">
                  <MessyPaperPage
                    side="left"
                    overflowVisible
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
                  <MessyElementsOverlay elements={DEFAULT_LEFT_OVERLAY} />
                </div>
              </div>,
              <div
                key={`${m.key}-notes`}
                className="relative h-full w-full overflow-visible rounded-l-none"
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: PAPER_BG,
                  boxSizing: "border-box",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  boxShadow: "inset 1px 0 0 rgba(0,0,0,0.06)",
                }}
              >
                <div className="absolute inset-0 overflow-visible rounded-l-none">
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
                      canvasItems={(canvasByMonth[`${year}-${m.index}`] ?? []).filter((it) => it.page === "right")}
                    />
                  </MessyPaperPage>
                  <ItemLayer
                    items={plannerItemsByMonth[m.key] ?? []}
                    pageSide="right"
                    pageWidth={BOOK_PAGE_WIDTH}
                    pageHeight={BOOK_PAGE_HEIGHT}
                  />
                  <MessyElementsOverlay elements={DEFAULT_RIGHT_OVERLAY} />
                </div>
              </div>,
            ])}
          </HTMLFlipBook>
        </div>
      </BulletJournalBook>

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
