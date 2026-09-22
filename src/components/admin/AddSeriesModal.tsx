"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import {
  addSeriesFromTmdb,
  searchTmdbSeries,
  type TmdbSeriesSearchItem,
} from "@/app/actions/series";
import { fieldClass } from "@/components/admin/AdminFormPrimitives";

export function AddSeriesModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: (title: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbSeriesSearchItem[]>([]);
  const [searching, startSearch] = useTransition();
  const [adding, startAdd] = useTransition();
  const [addingId, setAddingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !adding) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [adding, onClose]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleQueryChange(val: string) {
    setQuery(val);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      startSearch(async () => {
        const res = await searchTmdbSeries(val.trim());
        if (res.error) {
          setError(res.error);
          setResults([]);
        } else {
          setResults(res.results ?? []);
        }
      });
    }, 400);
  }

  function handleAdd(tmdbId: number) {
    if (adding) return;
    setAddingId(tmdbId);
    setError(null);
    startAdd(async () => {
      const res = await addSeriesFromTmdb(tmdbId);
      if (res.error) {
        setError(res.error);
        setAddingId(null);
        return;
      }
      if (res.title) onAdded(res.title);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !adding && onClose()}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#e8e0d4] bg-[#faf7f2] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e8e0d4] px-5 py-4">
          <h2 className="font-semibold text-[#1a1612]">Dizi Ekle</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={adding}
            className="rounded-lg px-2 py-1 text-[#1a1612]/40 transition hover:bg-[#1a1612]/8 hover:text-[#1a1612] disabled:opacity-40"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Dizi adı yaz… (ör: Breaking Bad)"
            className={fieldClass}
            disabled={adding}
          />
        </div>

        <div className="max-h-96 overflow-y-auto px-5 pb-5">
          {searching ? (
            <p className="py-8 text-center text-sm text-[#1a1612]/40">Aranıyor…</p>
          ) : null}

          {error ? (
            <p className="py-2 text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          {!searching &&
          results.length === 0 &&
          query.trim().length >= 2 &&
          !error ? (
            <p className="py-8 text-center text-sm text-[#1a1612]/40">
              Sonuç bulunamadı
            </p>
          ) : null}

          <div className="space-y-2">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleAdd(r.id)}
                disabled={adding}
                className="group flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition hover:border-[#e8e0d4] hover:bg-[#1a1612]/5 disabled:opacity-60"
              >
                <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md bg-[#1a1612]/5">
                  {r.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://image.tmdb.org/t/p/w92${r.poster_path}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[#1a1612]/25">
                      ?
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1a1612]">
                    {r.name}
                  </p>
                  {r.original_name && r.original_name !== r.name ? (
                    <p className="truncate text-xs text-[#1a1612]/40">
                      {r.original_name}
                    </p>
                  ) : null}
                  <div className="mt-0.5 flex items-center gap-2">
                    {r.first_air_date ? (
                      <span className="text-xs text-[#1a1612]/40">
                        {r.first_air_date.slice(0, 4)}
                      </span>
                    ) : null}
                    {r.vote_average > 0 ? (
                      <span className="text-xs text-[#b8934a]">
                        ★ {r.vote_average.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="shrink-0">
                  {addingId === r.id && adding ? (
                    <span className="text-xs text-[#1a1612]/40">Ekleniyor…</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-[#1a1612]/40 transition group-hover:text-amber-300">
                      <Plus className="h-3 w-3" />
                      Ekle
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
