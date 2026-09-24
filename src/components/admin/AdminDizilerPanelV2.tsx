"use client";

import { useState, useRef, useEffect } from "react";
import {
  searchTmdbSeries,
  addSeriesFromTmdb,
  refreshSeriesFromTmdb,
} from "@/app/actions/series";
import { toUiWatchStatus, syncWatchStatusForVisibility } from "@/lib/series-status-map";
import {
  Search,
  Plus,
  X,
  Heart,
  Trash2,
  RefreshCw,
  Edit3,
  Check,
  Tv,
} from "lucide-react";
import { ExcelIndirButonu } from "@/components/admin/ExcelIndirButonu";

export interface SeriesRow {
  content_id: string;
  title: string;
  slug: string;
  year: number | null;
  creator_or_director: string | null;
  genre_tags: string[] | null;
  poster_url: string | null;
  spine_url: string | null;
  review: string | null;
  rating_5: number | null;
  is_favorite: boolean;
  total_seasons: number | null;
  episodes_watched: number | null;
  avg_episode_min: number | null;
  seasons_watched: number | null;
  status: string | null;
  watch_status: string | null;
  watched_at: string | null;
  content_items: {
    id: string;
    title: string;
    slug: string;
    rating: number | null;
    visibility: string;
    created_at: string;
  };
}

type TabFilter = "hepsi" | "izlendi" | "izlenecek" | "arsiv";
type MainTab = "liste" | "ekle";

function visibilityLabel(v: string) {
  if (v === "public") return "İzlendi";
  if (v === "private") return "İzlenecek";
  if (v === "archived") return "Arşiv";
  if (v === "unlisted") return "Gizli";
  return v;
}

function statusLabel(s: string | null) {
  if (!s) return "";
  const map: Record<string, string> = {
    watching: "İzliyor",
    completed: "Bitti",
    dropped: "Bıraktı",
    watchlist: "İzlenecek",
    paused: "Beklemede",
    rewatching: "Tekrar izliyor",
    finished: "Bitti",
    waiting: "Devamını bekliyor",
  };
  return map[s] ?? s;
}

function listBucket(s: SeriesRow): Exclude<TabFilter, "hepsi"> {
  if (s.content_items.visibility === "archived") return "arsiv";
  if (
    s.content_items.visibility === "private" ||
    s.watch_status === "watchlist"
  ) {
    return "izlenecek";
  }
  return "izlendi";
}

function PosterThumb({
  src,
  alt,
  width,
  height,
}: {
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className="shrink-0 rounded bg-[#e8e0d4]"
        style={{ width, height }}
      />
    );
  }
  return (
    // Admin listesi: next/image host kısıtı bazı afişlerde sayfayı düşürüyordu
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="shrink-0 rounded object-cover"
      style={{ width, height }}
      onError={() => setFailed(true)}
    />
  );
}

function starCount(rating: number | null | undefined): number {
  if (rating == null || !Number.isFinite(rating) || rating <= 0) return 0;
  return Math.min(5, Math.max(0, Math.round(rating)));
}

const WATCH_STATUS_OPTIONS = [
  "completed",
  "watching",
  "paused",
  "dropped",
  "watchlist",
  "rewatching",
] as const;

function safeSelectStatus(status: string): string {
  return (WATCH_STATUS_OPTIONS as readonly string[]).includes(status)
    ? status
    : "completed";
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n === value ? 0 : n)}
          className={`text-lg transition-opacity ${
            n <= value ? "text-[#b8934a]" : "text-[#c8bfb4]"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

interface TmdbResult {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string | null;
  overview: string;
}

function TmdbSearchModal({
  onSelect,
  onClose,
}: {
  onSelect: (r: TmdbResult) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError("");
      return;
    }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      setError("");
      const res = await searchTmdbSeries(query);
      if (res.error) {
        setError(res.error);
        setResults([]);
      } else {
        setResults((res.results as TmdbResult[]) ?? []);
      }
      setLoading(false);
    }, 400);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--cream)] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-[#e8e0d4] px-4 py-3">
          <Search className="h-4 w-4 text-[#b8934a]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Dizi adı ara (TMDB)..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#a09588]"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-[#6b6158] hover:text-[#1a1612]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <p className="p-4 text-center text-sm text-[#6b6158]">Aranıyor…</p>
          )}
          {error && (
            <p className="p-4 text-center text-sm text-red-500">{error}</p>
          )}
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelect(r)}
              className="flex w-full items-center gap-3 border-b border-[#e8e0d4] px-4 py-3 text-left last:border-0 hover:bg-[#b8934a]/8"
            >
              {r.poster_path ? (
                <PosterThumb
                  src={`https://image.tmdb.org/t/p/w92${r.poster_path}`}
                  alt={r.name}
                  width={32}
                  height={48}
                />
              ) : (
                <div className="h-12 w-8 rounded bg-[#e8e0d4]" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#1a1612]">
                  {r.name}
                </p>
                <p className="text-xs text-[#6b6158]">
                  {r.first_air_date?.slice(0, 4) ?? "—"}
                </p>
              </div>
            </button>
          ))}
          {!loading && !error && results.length === 0 && query.trim() && (
            <p className="p-4 text-center text-sm text-[#6b6158]">
              Sonuç bulunamadı
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const fieldClass =
  "w-full rounded-xl border border-[#e8e0d4] bg-white px-3 py-2 text-sm outline-none focus:border-[#b8934a]/40";
const labelClass = "mb-1 block text-xs font-medium text-[#6b6158]";

function SeriesAddForm() {
  const [showTmdb, setShowTmdb] = useState(false);
  const [addingTmdb, setAddingTmdb] = useState<number | null>(null);
  const [manualMode, setManualMode] = useState(false);

  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [year, setYear] = useState("");
  const [totalSeasons, setTotalSeasons] = useState("");
  const [episodesWatched, setEpisodesWatched] = useState("");
  const [avgEpMin, setAvgEpMin] = useState("");
  const [genreTags, setGenreTags] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [spineUrl, setSpineUrl] = useState("");
  const [watchedAt, setWatchedAt] = useState("");
  const [status, setStatus] = useState("completed");
  const [rating5, setRating5] = useState(0);
  const [review, setReview] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleTmdbSelect(r: TmdbResult) {
    setShowTmdb(false);
    setAddingTmdb(r.id);
    const res = await addSeriesFromTmdb(r.id);
    if (res?.error) {
      setAddingTmdb(null);
      alert(res.error);
      return;
    }
    if (res?.seriesId) {
      await fetch(`/api/admin/series/${res.seriesId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: "public", status: "completed" }),
      });
    }
    window.location.reload();
  }

  async function handleManualSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Başlık zorunlu");
      return;
    }
    setSaving(true);
    setError("");
    const fd = new FormData();
    fd.append("title", title);
    fd.append("creator_or_director", director);
    fd.append("year", year);
    fd.append("total_seasons", totalSeasons);
    fd.append("episodes_watched", episodesWatched);
    fd.append("avg_episode_min", avgEpMin);
    fd.append("genre_tags", genreTags);
    fd.append("poster_url", posterUrl);
    fd.append("spine_url", spineUrl);
    fd.append("watched_at", watchedAt);
    const nextStatus = syncWatchStatusForVisibility(visibility, status);
    fd.append("status", nextStatus);
    if (rating5) fd.append("rating_5", String(rating5));
    fd.append("review", review);
    fd.append("is_favorite", String(isFavorite));
    fd.append("visibility", visibility);
    const { createSeries } = await import("@/app/actions");
    const result = await createSeries(fd);
    setSaving(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    window.location.reload();
  }

  if (addingTmdb) {
    return (
      <div className="py-12 text-center text-sm text-[#6b6158]">
        TMDB&apos;den çekiliyor…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showTmdb && (
        <TmdbSearchModal
          onSelect={handleTmdbSelect}
          onClose={() => setShowTmdb(false)}
        />
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowTmdb(true)}
          className="flex items-center gap-2 rounded-xl border border-[#b8934a]/30 bg-[#b8934a]/8 px-4 py-2.5 text-sm font-medium text-[#b8934a] transition-colors hover:bg-[#b8934a]/15"
        >
          <Search className="h-4 w-4" />
          TMDB&apos;den Ekle
        </button>
        <button
          type="button"
          onClick={() => setManualMode(!manualMode)}
          className="flex items-center gap-2 rounded-xl border border-[#e8e0d4] px-4 py-2.5 text-sm text-[#6b6158] transition-colors hover:border-[#b8934a]/30 hover:text-[#b8934a]"
        >
          <Plus className="h-4 w-4" />
          Manuel Gir
        </button>
      </div>

      {manualMode && (
        <form
          onSubmit={handleManualSave}
          className="space-y-4 rounded-2xl border border-[#e8e0d4] bg-white/60 p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Başlık *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Yönetmen / Yaratıcı</label>
              <input
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Yıl</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Toplam Sezon</label>
              <input
                type="number"
                value={totalSeasons}
                onChange={(e) => setTotalSeasons(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>İzlenen Bölüm</label>
              <input
                type="number"
                value={episodesWatched}
                onChange={(e) => setEpisodesWatched(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Ort. Bölüm Süresi (dk)</label>
              <input
                type="number"
                value={avgEpMin}
                onChange={(e) => setAvgEpMin(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>İzlenme Tarihi</label>
              <input
                type="date"
                value={watchedAt}
                onChange={(e) => setWatchedAt(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Türler (virgülle)</label>
              <input
                value={genreTags}
                onChange={(e) => setGenreTags(e.target.value)}
                placeholder="Drama, Komedi, Gerilim"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Poster URL</label>
              <input
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Sırt URL</label>
              <input
                value={spineUrl}
                onChange={(e) => setSpineUrl(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {["izlendi", "izlenecek", "arsiv"].map((v) => {
              const val =
                v === "izlendi"
                  ? "public"
                  : v === "izlenecek"
                    ? "private"
                    : "archived";
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setVisibility(val);
                    setStatus((prev) => syncWatchStatusForVisibility(val, prev));
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                    visibility === val
                      ? "bg-[#b8934a] text-[#faf7f2]"
                      : "border border-[#e8e0d4] text-[#6b6158] hover:border-[#b8934a]/30"
                  }`}
                >
                  {v === "izlendi"
                    ? "İzlendi"
                    : v === "izlenecek"
                      ? "İzlenecek"
                      : "Arşiv"}
                </button>
              );
            })}
          </div>

          <div>
            <label className={labelClass}>İzleme Durumu</label>
            <select
              value={safeSelectStatus(status)}
              onChange={(e) => setStatus(e.target.value)}
              className={fieldClass}
            >
              <option value="completed">Bitti</option>
              <option value="watching">İzliyor</option>
              <option value="paused">Beklemede</option>
              <option value="dropped">Bıraktı</option>
              <option value="watchlist">İzlenecek</option>
              <option value="rewatching">Tekrar izliyor</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Puan</label>
            <StarRating value={rating5} onChange={setRating5} />
          </div>

          <div>
            <label className={labelClass}>Yorum</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              className={`${fieldClass} resize-none`}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="accent-[#b8934a]"
            />
            <Heart
              className={`h-4 w-4 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-[#a09588]"
              }`}
            />
            Favori
          </label>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#1a1612] py-2.5 text-sm font-medium text-[#faf7f2] transition-colors hover:bg-[#b8934a] disabled:opacity-50"
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </form>
      )}
    </div>
  );
}

function SeriesEditForm({
  series,
  onSave,
  onCancel,
  onDelete,
}: {
  series: SeriesRow;
  onSave: (updated: SeriesRow) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(series.content_items.title);
  const [slug, setSlug] = useState(series.content_items.slug);
  const [visibility, setVisibility] = useState(series.content_items.visibility);
  const [director, setDirector] = useState(series.creator_or_director ?? "");
  const [year, setYear] = useState(String(series.year ?? ""));
  const [totalSeasons, setTotalSeasons] = useState(
    String(series.total_seasons ?? "")
  );
  const [episodesWatched, setEpisodesWatched] = useState(
    String(series.episodes_watched ?? "")
  );
  const [avgEpMin, setAvgEpMin] = useState(String(series.avg_episode_min ?? ""));
  const [genreTags, setGenreTags] = useState(
    (series.genre_tags ?? []).join(", ")
  );
  const [posterUrl, setPosterUrl] = useState(series.poster_url ?? "");
  const [spineUrl, setSpineUrl] = useState(series.spine_url ?? "");
  const [watchedAt, setWatchedAt] = useState(
    series.watched_at?.slice(0, 10) ?? ""
  );
  const [status, setStatus] = useState(
    toUiWatchStatus(series.watch_status, series.status)
  );
  const [rating5, setRating5] = useState(Math.round(series.rating_5 ?? 0));
  const [review, setReview] = useState(series.review ?? "");
  const [isFavorite, setIsFavorite] = useState(series.is_favorite);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    const nextStatus = syncWatchStatusForVisibility(visibility, status);
    if (nextStatus !== status) setStatus(nextStatus);
    const numOrNull = (raw: string) => {
      if (!raw.trim()) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    };
    try {
      const res = await fetch(`/api/admin/series/${series.content_items.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          visibility,
          creator_or_director: director,
          year: numOrNull(year),
          total_seasons: numOrNull(totalSeasons),
          episodes_watched: numOrNull(episodesWatched),
          avg_episode_min: numOrNull(avgEpMin),
          genre_tags: genreTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          poster_url: posterUrl || null,
          spine_url: spineUrl || null,
          watched_at: watchedAt || null,
          status: nextStatus,
          rating_5: rating5 || null,
          review: review || null,
          is_favorite: isFavorite,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError((d as { error?: string }).error ?? "Kaydedilemedi");
        return;
      }
      onSave({
        ...series,
        title,
        slug,
        creator_or_director: director,
        year: numOrNull(year),
        total_seasons: numOrNull(totalSeasons),
        episodes_watched: numOrNull(episodesWatched),
        avg_episode_min: numOrNull(avgEpMin),
        genre_tags: genreTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        poster_url: posterUrl || null,
        spine_url: spineUrl || null,
        watched_at: watchedAt || null,
        status: nextStatus,
        watch_status: nextStatus,
        rating_5: rating5 || null,
        review: review || null,
        is_favorite: isFavorite,
        content_items: { ...series.content_items, title, slug, visibility },
      });
    } catch {
      setError("Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const res = await fetch(`/api/admin/series/${series.content_items.id}`, {
      method: "DELETE",
    });
    if (res.ok) onDelete();
    else {
      const d = await res.json().catch(() => ({}));
      setError((d as { error?: string }).error ?? "Silinemedi");
    }
  }

  async function handleTmdbRefresh() {
    setRefreshing(true);
    const result = await refreshSeriesFromTmdb(series.content_items.id);
    setRefreshing(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
      return;
    }
    window.location.reload();
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#b8934a]/20 bg-[#b8934a]/5 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Başlık</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={`${fieldClass} font-mono`}
          />
        </div>
        <div>
          <label className={labelClass}>Yönetmen / Yaratıcı</label>
          <input
            value={director}
            onChange={(e) => setDirector(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Yıl</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Toplam Sezon</label>
          <input
            type="number"
            value={totalSeasons}
            onChange={(e) => setTotalSeasons(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>İzlenen Bölüm</label>
          <input
            type="number"
            value={episodesWatched}
            onChange={(e) => setEpisodesWatched(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Ort. Bölüm Süresi (dk)</label>
          <input
            type="number"
            value={avgEpMin}
            onChange={(e) => setAvgEpMin(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>İzlenme Tarihi</label>
          <input
            type="date"
            value={watchedAt}
            onChange={(e) => setWatchedAt(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Türler (virgülle)</label>
          <input
            value={genreTags}
            onChange={(e) => setGenreTags(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Poster URL</label>
          <input
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Sırt URL</label>
          <input
            value={spineUrl}
            onChange={(e) => setSpineUrl(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-[#6b6158]">Durum</p>
        <div className="flex flex-wrap gap-2">
          {(["public", "private", "archived"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setVisibility(v);
                setStatus((prev) => syncWatchStatusForVisibility(v, prev));
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                visibility === v
                  ? "bg-[#b8934a] text-[#faf7f2]"
                  : "border border-[#e8e0d4] text-[#6b6158] hover:border-[#b8934a]/30"
              }`}
            >
              {visibilityLabel(v)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>İzleme Durumu</label>
        <select
          value={safeSelectStatus(status)}
          onChange={(e) => setStatus(e.target.value)}
          className={fieldClass}
        >
          <option value="completed">Bitti</option>
          <option value="watching">İzliyor</option>
          <option value="paused">Beklemede</option>
          <option value="dropped">Bıraktı</option>
          <option value="watchlist">İzlenecek</option>
          <option value="rewatching">Tekrar izliyor</option>
        </select>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-[#6b6158]">Puan</p>
        <StarRating value={rating5} onChange={setRating5} />
      </div>

      <div>
        <label className={labelClass}>Yorum</label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
          className={`${fieldClass} resize-none`}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isFavorite}
          onChange={(e) => setIsFavorite(e.target.checked)}
          className="accent-[#b8934a]"
        />
        <Heart
          className={`h-4 w-4 ${
            isFavorite ? "fill-red-500 text-red-500" : "text-[#a09588]"
          }`}
        />
        Favori
      </label>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex flex-wrap items-center gap-2 border-t border-[#e8e0d4] pt-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-xl bg-[#1a1612] px-4 py-2 text-xs font-medium text-[#faf7f2] transition-colors hover:bg-[#b8934a] disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={handleTmdbRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-xl border border-[#e8e0d4] px-3 py-2 text-xs text-[#6b6158] transition-colors hover:border-[#b8934a]/30 hover:text-[#b8934a] disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          TMDB Yenile
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-[#e8e0d4] px-3 py-2 text-xs text-[#6b6158] transition-colors hover:border-[#b8934a]/30 hover:text-[#b8934a]"
        >
          İptal
        </button>
        <div className="ml-auto">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-500">Emin misin?</span>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-red-500 px-3 py-2 text-xs font-medium text-[#faf7f2] hover:bg-red-600"
              >
                Sil
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-xl border border-[#e8e0d4] px-3 py-2 text-xs text-[#6b6158]"
              >
                Hayır
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs text-red-500 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Sil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminDizilerPanelV2({
  initialSeries,
}: {
  initialSeries: SeriesRow[];
}) {
  const [series, setSeries] = useState<SeriesRow[]>(initialSeries);
  const [mainTab, setMainTab] = useState<MainTab>("liste");
  const [filterTab, setFilterTab] = useState<TabFilter>("hepsi");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const counts = {
    hepsi: series.length,
    izlendi: series.filter((s) => listBucket(s) === "izlendi").length,
    izlenecek: series.filter((s) => listBucket(s) === "izlenecek").length,
    arsiv: series.filter((s) => listBucket(s) === "arsiv").length,
  };

  const filtered = series.filter((s) => {
    if (filterTab !== "hepsi" && listBucket(s) !== filterTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.content_items.title.toLowerCase().includes(q) ||
        (s.creator_or_director ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filterTabs: { key: TabFilter; label: string }[] = [
    { key: "hepsi", label: "Hepsi" },
    { key: "izlendi", label: "İzlendi" },
    { key: "izlenecek", label: "İzlenecek" },
    { key: "arsiv", label: "Arşiv" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Tv className="h-6 w-6 text-[#b8934a]" />
          <h1 className="text-2xl font-semibold text-[#1a1612]">Diziler</h1>
        </div>
        <ExcelIndirButonu tur="diziler" />
      </header>

      <div className="flex gap-1 rounded-2xl border border-[#e8e0d4] bg-[#f4f0ea] p-1">
        {(["liste", "ekle"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setMainTab(t)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
              mainTab === t
                ? "bg-white text-[#1a1612] shadow-sm"
                : "text-[#6b6158] hover:text-[#1a1612]"
            }`}
          >
            {t === "liste" ? `Liste (${series.length})` : "Ekle"}
          </button>
        ))}
      </div>

      {mainTab === "ekle" && <SeriesAddForm />}

      {mainTab === "liste" && (
        <div className="space-y-4">
          <div className="flex gap-1 text-sm">
            {filterTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setFilterTab(t.key)}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  filterTab === t.key
                    ? "bg-[#1a1612] text-[#faf7f2]"
                    : "text-[#6b6158] hover:text-[#1a1612]"
                }`}
              >
                {t.label}
                <span className="ml-1 text-xs opacity-60">{counts[t.key]}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#e8e0d4] bg-white px-3 py-2">
            <Search className="h-4 w-4 text-[#a09588]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Dizi veya yönetmen ara…"
              className="flex-1 text-sm outline-none placeholder:text-[#a09588]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-[#a09588] hover:text-[#1a1612]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="divide-y divide-[#e8e0d4]">
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-[#a09588]">
                {search ? "Sonuç bulunamadı." : "Henüz dizi yok."}
              </p>
            )}
            {filtered.map((s, i) => (
              <div key={s.content_items.id} className="group py-3">
                {editingId === s.content_items.id ? (
                  <SeriesEditForm
                    series={s}
                    onSave={(updated) => {
                      setSeries((p) =>
                        p.map((x) =>
                          x.content_items.id === updated.content_items.id
                            ? updated
                            : x
                        )
                      );
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                    onDelete={() => {
                      setSeries((p) =>
                        p.filter(
                          (x) => x.content_items.id !== s.content_items.id
                        )
                      );
                      setEditingId(null);
                    }}
                  />
                ) : (
                  <div className="flex items-start gap-3">
                    {s.poster_url ? (
                      <PosterThumb
                        src={s.poster_url}
                        alt={s.content_items.title}
                        width={40}
                        height={60}
                      />
                    ) : (
                      <div className="h-[60px] w-10 shrink-0 rounded bg-[#e8e0d4]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#1a1612]">
                            <span className="mr-1.5 text-xs text-[#a09588]">
                              {i + 1}.
                            </span>
                            {s.content_items.title}
                          </p>
                          <p className="text-xs text-[#6b6158]">
                            {[s.creator_or_director, s.year]
                              .filter(Boolean)
                              .join(" · ")}
                            {(s.watch_status || s.status) &&
                              ` · ${statusLabel(s.watch_status || s.status)}`}
                          </p>
                          {starCount(s.rating_5) > 0 && (
                            <p className="mt-0.5 text-xs text-[#b8934a]">
                              {"★".repeat(starCount(s.rating_5))}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                          {s.is_favorite && (
                            <Heart className="h-3.5 w-3.5 fill-red-400 text-red-400" />
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              listBucket(s) === "izlendi"
                                ? "bg-green-50 text-green-700"
                                : listBucket(s) === "izlenecek"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {listBucket(s) === "izlendi"
                              ? "İzlendi"
                              : listBucket(s) === "izlenecek"
                                ? "İzlenecek"
                                : "Arşiv"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingId(s.content_items.id)}
                            className="rounded-lg p-1.5 text-[#6b6158] transition-colors hover:bg-[#b8934a]/10 hover:text-[#b8934a]"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
