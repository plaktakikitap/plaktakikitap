"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { playSound, AUDIO } from "@/lib/audio";
import { AnimatePresence } from "framer-motion";
import { CalendarGrid, monthNameTR } from "@/components/planner/CalendarGrid";
import { DayJournalModal } from "@/components/planner/DayJournalModal";
import type { DaySmudge } from "@/lib/planner";
import { PaperPage } from "@/components/planner/PaperPage";
import type {
  PlannerDaySummary,
  PlannerEntryWithMedia,
  PlannerDecor,
} from "@/lib/planner";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

const MONTH_LABELS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const PAPER_BG = "#f2ead7";

function MonthCalendarPage({
  year,
  monthIndex,
  summaryByDate,
  onDayClick,
}: {
  year: number;
  monthIndex: number;
  summaryByDate: Record<string, PlannerDaySummary>;
  onDayClick: (dateStr: string, monthName: string, day: number) => void;
}) {
  return (
    <PaperPage
      className="h-full w-full border-0 rounded-none shadow-none min-h-0"
      variant="calendar"
    >
      <CalendarGrid
        year={year}
        monthIndex={monthIndex}
        summaryByDate={summaryByDate}
        onDayClick={onDayClick}
      />
    </PaperPage>
  );
}

function MonthNotesPage({ monthName }: { monthName: string }) {
  return (
    <PaperPage
      className="h-full w-full border-0 rounded-none shadow-none min-h-0"
      variant="notes"
      cornerCurl
    >
      <h3 className="text-xl font-semibold">{monthName} — Notlar</h3>
      <div className="mt-4 space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-5 w-full rounded-md bg-black/5" />
        ))}
      </div>
    </PaperPage>
  );
}

export default function PlannerFlipbook() {
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
  const [decors, setDecors] = useState<PlannerDecor[]>([]);

  // Decors fetch (admin'den eklenen sticker/tape vb.)
  useEffect(() => {
    fetch(`/api/planner/decor?year=${year}&month=${monthIndex}`)
      .then((r) => r.json())
      .then((data) => setDecors(Array.isArray(data) ? data : []))
      .catch(() => setDecors([]));
  }, [year, monthIndex]);

  // startPage: spread index * 2 (ilk sayfa sol)
  const startPage = monthIndex * 2;
  const lastFlipTime = useRef(0);
  const flipStartTime = useRef<number | null>(null);
  const [flipInProgress, setFlipInProgress] = useState(false);

  const handleChangeState = useCallback((e: { data: string }) => {
    if (e.data === "flipping") flipStartTime.current = Date.now();
    setFlipInProgress(e.data === "flipping");
  }, []);

  const handleFlip = useCallback((e: { data: number }) => {
    const newIdx = Math.floor(e.data / 2);
    setMonthIndex(newIdx);
    const now = Date.now();
    if (now - lastFlipTime.current > 150) {
      lastFlipTime.current = now;
      const elapsed = flipStartTime.current != null ? now - flipStartTime.current : 650;
      flipStartTime.current = null;
      const basePitch = 1.0 + (650 - elapsed) / 650 * 0.1;
      const pitch = Math.max(0.9, Math.min(1.1, basePitch + (Math.random() - 0.5) * 0.04));
      playSound(AUDIO.paperFlip, { volume: 0.5, playbackRate: pitch });
      const summaries = summaryCache[`${year}-${newIdx}`] ?? [];
      const hasAttachments = summaries.some((s) => (s.attachedImages?.length ?? 0) > 0 || (s.paperclipImageUrls?.length ?? 0) > 0);
      if (hasAttachments) {
        setTimeout(() => playSound(AUDIO.metallicClick, { volume: 0.22, playbackRate: 1.05 }), 120);
      }
    }
  }, [summaryCache, year]);

  // Tüm ayların verilerini yükle
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
    try {
      const res = await fetch(`/api/planner/entries/${dateStr}`);
      const data = await res.json();
      setModalEntries(Array.isArray(data) ? data : []);
    } catch {
      setModalEntries([]);
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
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Ajanda</h2>
      </div>

      <div className="w-full flex justify-center">
        <div className="relative overflow-hidden rounded-[28px] shadow-[0_30px_120px_rgba(0,0,0,0.55)]" data-flipping={flipInProgress}>
          {/* Defter kalınlığı — alt sayfa çıkıntısı */}
          <div
            className="pointer-events-none absolute -bottom-3 left-10 right-10 h-10 rounded-b-[28px] bg-white/10 blur-[2px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-2 left-8 right-8 h-8 rounded-b-[26px] bg-black/30"
            aria-hidden
          />

          {/* Gutter shadow — tel yok, sadece bitişik defter hissi */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 left-1/2 w-10 -translate-x-1/2 bg-gradient-to-r from-black/25 via-black/10 to-black/25 opacity-60 z-[1]"
            aria-hidden
          />

          <HTMLFlipBook
            width={520}
            height={640}
            size="fixed"
            startZIndex={0}
            autoSize={false}
            minWidth={320}
            maxWidth={520}
            minHeight={420}
            maxHeight={640}
            usePortrait={false}
            showCover={false}
            mobileScrollSupport
            maxShadowOpacity={0.2}
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
                className="h-full w-full"
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: PAPER_BG,
                  boxSizing: "border-box",
                }}
              >
                <MonthCalendarPage
                  year={year}
                  monthIndex={m.index}
                  summaryByDate={summaryByDateFor(m.index)}
                  onDayClick={handleDayClick}
                />
              </div>,
              <div
                key={`${m.key}-notes`}
                className="h-full w-full"
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: PAPER_BG,
                  boxSizing: "border-box",
                }}
              >
                <MonthNotesPage monthName={m.label} />
              </div>,
            ])}
          </HTMLFlipBook>
        </div>
      </div>

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
