"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, Check } from "lucide-react";
import type { ContentItem, Film } from "@/types/database";
import { WatchLogGrid } from "./WatchLogGrid";

export type FilmItem = ContentItem & { film: Film | Film[] | null };

function getFilm(d: FilmItem): Film | null {
  const f = d.film;
  if (!f) return null;
  return Array.isArray(f) ? f[0] ?? null : f;
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "date-desc", label: "İzleme tarihi (en yeni)" },
  { value: "date-asc", label: "İzleme tarihi (en eski)" },
  { value: "genre-asc", label: "Tür (A-Z)" },
  { value: "genre-desc", label: "Tür (Z-A)" },
  { value: "rating-desc", label: "Puan (yüksekten düşüğe)" },
  { value: "duration-desc", label: "Süre (uzundan kısaya)" },
  { value: "duration-asc", label: "Süre (kısadan uzuya)" },
  { value: "title-asc", label: "Başlık (A-Z)" },
  { value: "title-desc", label: "Başlık (Z-A)" },
];

interface WatchLogFilterableSectionProps {
  films: FilmItem[];
  /** When set, parent controls the detail modal (shared with FavoriteVitrin). */
  onSelectFilm?: (item: FilmItem | null) => void;
}

export function WatchLogFilterableSection({ films, onSelectFilm }: WatchLogFilterableSectionProps) {
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string>("date-asc");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const genres = useMemo(() => {
    const set = new Set<string>();
    films.forEach((item) => {
      const film = getFilm(item);
      (film?.genre_tags ?? []).forEach((g: string) => set.add(g));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [films]);

  const getWatchedAt = (item: FilmItem): string =>
    getFilm(item)?.watched_at ?? item.created_at;

  const filteredAndSorted = useMemo(() => {
    let list = films;

    if (genreFilter != null) {
      list = list.filter((item) => {
        const film = getFilm(item);
        const tags = film?.genre_tags ?? [];
        return tags.includes(genreFilter);
      });
    }

    list = [...list];
    const getF = (item: FilmItem) => getFilm(item);

    const firstGenre = (item: FilmItem) => {
      const tags = getF(item)?.genre_tags ?? [];
      return tags[0] ?? "";
    };
    switch (sortKey) {
      case "date-desc":
        list.sort((a, b) => new Date(getWatchedAt(b)).getTime() - new Date(getWatchedAt(a)).getTime());
        break;
      case "date-asc":
        list.sort((a, b) => new Date(getWatchedAt(a)).getTime() - new Date(getWatchedAt(b)).getTime());
        break;
      case "genre-asc":
        list.sort((a, b) => {
          const c = firstGenre(a).localeCompare(firstGenre(b), "tr");
          return c !== 0 ? c : a.title.localeCompare(b.title, "tr");
        });
        break;
      case "genre-desc":
        list.sort((a, b) => {
          const c = firstGenre(b).localeCompare(firstGenre(a), "tr");
          return c !== 0 ? c : a.title.localeCompare(b.title, "tr");
        });
        break;
      case "rating-desc":
        list.sort((a, b) => {
          const ra = getF(a)?.rating_5 ?? -1;
          const rb = getF(b)?.rating_5 ?? -1;
          return rb - ra;
        });
        break;
      case "duration-desc":
        list.sort((a, b) => (getF(b)?.duration_min ?? 0) - (getF(a)?.duration_min ?? 0));
        break;
      case "duration-asc":
        list.sort((a, b) => (getF(a)?.duration_min ?? 0) - (getF(b)?.duration_min ?? 0));
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
  }, [films, genreFilter, sortKey]);

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

  const shelfNewestAtEnd = sortKey === "date-asc";
  const shelfNewestFirst = sortKey === "date-desc";

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-white/60">
        <span className="mr-1">Raf sırası:</span>
        <button
          type="button"
          onClick={() => setSortKey("date-asc")}
          className={`rounded-lg px-3 py-1.5 transition-colors ${shelfNewestAtEnd ? "bg-amber-400/20 text-amber-200" : "hover:bg-white/10 hover:text-white/80"}`}
        >
          En yeni en sonda
        </button>
        <button
          type="button"
          onClick={() => setSortKey("date-desc")}
          className={`rounded-lg px-3 py-1.5 transition-colors ${shelfNewestFirst ? "bg-amber-400/20 text-amber-200" : "hover:bg-white/10 hover:text-white/80"}`}
        >
          En yeni en başta
        </button>
      </div>
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
            Filtrele
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
                  <div className="px-3 pb-1 pt-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                      Tür
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setGenreFilter(null);
                      }}
                      className="mt-1.5 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/90 transition-colors hover:bg-white/10"
                    >
                      {genreFilter == null && (
                        <Check className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
                      )}
                      {genreFilter != null && <span className="w-4 shrink-0" />}
                      Tümü
                    </button>
                    {genres.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setGenreFilter(g);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/90 transition-colors hover:bg-white/10"
                      >
                        {genreFilter === g ? (
                          <Check className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
                        ) : (
                          <span className="w-4 shrink-0" />
                        )}
                        {g}
                      </button>
                    ))}
                  </div>
                  <div className="my-1 border-t border-white/10" />
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
                  {genreFilter != null && <span className="mr-2">Tür: {genreFilter}</span>}
                  <span>{currentSortLabel}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <WatchLogGrid films={filteredAndSorted} onSelectFilm={onSelectFilm} />
    </section>
  );
}
