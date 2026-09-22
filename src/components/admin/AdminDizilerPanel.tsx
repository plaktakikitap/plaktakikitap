"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Search } from "lucide-react";
import {
  getAdminSeriesSeasons,
  refreshSeriesFromTmdb,
  updateWatchStatus,
  type WatchStatus,
} from "@/app/actions/series";
import { AddSeriesModal } from "@/components/admin/AddSeriesModal";
import { showAdminToast } from "@/components/admin/admin-toast-events";
import { fieldClass } from "@/components/admin/AdminFormPrimitives";
import { SeasonAccordion } from "@/components/series/SeasonAccordion";
import type {
  AdminSeriesListItem,
  SeriesSeasonItem,
} from "@/lib/series-progress";

const STATUS_OPTIONS: { value: WatchStatus; label: string }[] = [
  { value: "watching", label: "İzleniyor" },
  { value: "completed", label: "Bitti" },
  { value: "dropped", label: "Bıraktım" },
  { value: "watchlist", label: "İzlenecek" },
];

function statusValue(s: string | null): WatchStatus {
  if (s === "rewatching") return "watching";
  if (
    s === "watching" ||
    s === "completed" ||
    s === "dropped" ||
    s === "watchlist"
  ) {
    return s;
  }
  return "watchlist";
}

export function AdminDizilerPanel({
  initialSeries,
}: {
  initialSeries: AdminSeriesListItem[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState(initialSeries);
  const [openId, setOpenId] = useState<string | null>(null);
  const [seasonsById, setSeasonsById] = useState<
    Record<string, SeriesSeasonItem[]>
  >({});
  const [loadingSeasonsId, setLoadingSeasonsId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setRows(initialSeries);
  }, [initialSeries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return rows;
    return rows.filter((row) => {
      const title = row.title.toLocaleLowerCase("tr-TR");
      const year = row.year != null ? String(row.year) : "";
      return title.includes(q) || year.includes(q);
    });
  }, [rows, query]);

  async function toggleEpisodes(seriesId: string) {
    if (openId === seriesId) {
      setOpenId(null);
      return;
    }
    setOpenId(seriesId);
    if (seasonsById[seriesId]) return;
    setLoadingSeasonsId(seriesId);
    const res = await getAdminSeriesSeasons(seriesId);
    setLoadingSeasonsId(null);
    if ("error" in res) {
      showAdminToast("error", res.error);
      setOpenId(null);
      return;
    }
    setSeasonsById((prev) => ({ ...prev, [seriesId]: res.seasons }));
  }

  function onStatusChange(seriesId: string, status: WatchStatus) {
    setRows((prev) =>
      prev.map((row) =>
        row.contentId === seriesId ? { ...row, watchStatus: status } : row
      )
    );
    startTransition(async () => {
      const res = await updateWatchStatus(seriesId, status);
      if (res && "error" in res) {
        showAdminToast("error", res.error);
        router.refresh();
        return;
      }
      showAdminToast("success", "Durum güncellendi");
    });
  }

  async function onRefreshTmdb(row: AdminSeriesListItem) {
    setRefreshingId(row.contentId);
    const res = await refreshSeriesFromTmdb(row.contentId);
    setRefreshingId(null);
    if ("error" in res) {
      showAdminToast("error", res.error);
      return;
    }
    showAdminToast("success", "TMDB’den yenilendi");
    setSeasonsById((prev) => {
      const next = { ...prev };
      delete next[row.contentId];
      return next;
    });
    if (openId === row.contentId) {
      setLoadingSeasonsId(row.contentId);
      const seasonsRes = await getAdminSeriesSeasons(row.contentId);
      setLoadingSeasonsId(null);
      if ("seasons" in seasonsRes) {
        setSeasonsById((prev) => ({
          ...prev,
          [row.contentId]: seasonsRes.seasons,
        }));
      }
    }
    router.refresh();
  }

  function handleSeriesAdded(title: string) {
    showAdminToast("success", `"${title}" eklendi ve zenginleştiriliyor…`);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Dizi ara…"
            className={`${fieldClass} pl-10`}
            aria-label="Dizi ara"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20"
        >
          <Plus className="h-4 w-4" />
          Dizi Ekle
        </button>
      </div>

      {showAddModal ? (
        <AddSeriesModal
          onClose={() => setShowAddModal(false)}
          onAdded={handleSeriesAdded}
        />
      ) : null}

      <p className="text-xs text-white/40">
        {filtered.length} / {rows.length} dizi
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-white/45">
          Eşleşen dizi yok.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((row) => {
            const open = openId === row.contentId;
            const refreshing = refreshingId === row.contentId;
            const loadingSeasons = loadingSeasonsId === row.contentId;
            const canRefresh = Boolean(row.tmdbId || row.imdbId);

            return (
              <li
                key={row.contentId}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
                  {row.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.posterUrl}
                      alt=""
                      className="h-16 w-11 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded-md bg-white/5 text-[10px] text-white/30">
                      —
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{row.title}</p>
                    <p className="text-xs text-white/40">
                      {[row.year, row.totalSeasons ? `${row.totalSeasons} sezon` : null]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>

                  <select
                    value={statusValue(row.watchStatus)}
                    onChange={(e) =>
                      onStatusChange(
                        row.contentId,
                        e.target.value as WatchStatus
                      )
                    }
                    className={`${fieldClass} sm:w-40`}
                    aria-label={`${row.title} durumu`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleEpisodes(row.contentId)}
                      className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10"
                    >
                      {open ? "Bölümleri Gizle" : "Bölümleri Görüntüle"}
                    </button>
                    <button
                      type="button"
                      disabled={!canRefresh || refreshing}
                      onClick={() => void onRefreshTmdb(row)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200 transition hover:bg-amber-400/20 disabled:opacity-40"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
                      />
                      {refreshing ? "Yenileniyor…" : "TMDB'den Yenile"}
                    </button>
                  </div>
                </div>

                {open ? (
                  <div className="border-t border-white/10 px-3 py-4 sm:px-4">
                    {loadingSeasons ? (
                      <p className="py-6 text-center text-sm text-white/40">
                        Bölümler yükleniyor…
                      </p>
                    ) : (
                      <SeasonAccordion
                        seriesId={row.contentId}
                        seasons={seasonsById[row.contentId] ?? []}
                        canEdit
                        variant="admin"
                      />
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
