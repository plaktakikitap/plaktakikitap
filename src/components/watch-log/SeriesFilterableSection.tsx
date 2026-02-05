"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, Check } from "lucide-react";
import type { ContentItem, Series } from "@/types/database";
import { SeriesCollectionWithModal, type SeriesItem } from "./SeriesCollectionWithModal";

function getSeries(d: SeriesItem): Series | null {
  const s = d.series;
  if (!s) return null;
  return Array.isArray(s) ? s[0] ?? null : s;
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "date-desc", label: "İzleme tarihi (en yeni)" },
  { value: "date-asc", label: "İzleme tarihi (en eski)" },
  { value: "rating-desc", label: "Puan (yüksekten düşüğe)" },
  { value: "duration-desc", label: "Süre (uzundan kısaya)" },
  { value: "duration-asc", label: "Süre (kısadan uzuya)" },
  { value: "title-asc", label: "Başlık (A-Z)" },
  { value: "title-desc", label: "Başlık (Z-A)" },
];

interface SeriesFilterableSectionProps {
  seriesList: SeriesItem[];
}

export function SeriesFilterableSection({ seriesList }: SeriesFilterableSectionProps) {
  const [sortKey, setSortKey] = useState<string>("date-asc");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getWatchedAt = (item: SeriesItem): string =>
    getSeries(item)?.watched_at ?? item.created_at;

  const sorted = useMemo(() => {
    const list = [...seriesList];
    const getS = (item: SeriesItem) => getSeries(item);
    const totalMin = (item: SeriesItem) => {
      const s = getS(item);
      return (
        s?.total_duration_min ??
        (s?.episodes_watched ?? 0) * (s?.avg_episode_min ?? 0)
      );
    };
    const rating = (item: SeriesItem) => item.rating ?? -1;

    switch (sortKey) {
      case "date-desc":
        list.sort((a, b) => new Date(getWatchedAt(b)).getTime() - new Date(getWatchedAt(a)).getTime());
        break;
      case "date-asc":
        list.sort((a, b) => new Date(getWatchedAt(a)).getTime() - new Date(getWatchedAt(b)).getTime());
        break;
      case "rating-desc":
        list.sort((a, b) => rating(b) - rating(a));
        break;
      case "duration-desc":
        list.sort((a, b) => totalMin(b) - totalMin(a));
        break;
      case "duration-asc":
        list.sort((a, b) => totalMin(a) - totalMin(b));
        break;
      case "title-asc":
        list.sort((a, b) => a.title.localeCompare(b.title, "tr"));
        break;
      case "title-desc":
        list.sort((a, b) => b.title.localeCompare(a.title, "tr"));
        break;
      default:
        list.sort((a, b) => new Date(getWatchedAt(a)).getTime() - new Date(getWatchedAt(b)).getTime());
    }
    return list;
  }, [seriesList, sortKey]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortKey)?.label ?? "Sırala";

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-editorial text-xl font-medium text-white/90">
          Koleksiyon
        </h2>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white/90 backdrop-blur-md transition-all hover:border-amber-400/30 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <Filter className="h-4 w-4 text-amber-400/90" aria-hidden />
            Sırala
            <ChevronDown
              className={`h-4 w-4 text-white/60 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl"
              >
                <div className="max-h-[70vh] overflow-y-auto py-2">
                  <div className="px-3 pb-2 pt-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                      Sırala
                    </p>
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSortKey(opt.value);
                        }}
                        className="mt-1.5 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/90 transition-colors hover:bg-white/10"
                      >
                        {sortKey === opt.value ? (
                          <Check className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
                        ) : (
                          <span className="w-4 shrink-0" />
                        )}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/10 px-3 py-2 text-xs text-white/50">
                  {currentSortLabel}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <SeriesCollectionWithModal seriesList={sorted} />
    </section>
  );
}
