"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminCreateFilm,
  adminCreateSeries,
  adminCreateBook,
  adminDeleteContent,
} from "@/app/admin/actions";
import type { RecentItem } from "@/lib/db/queries";
import { Film, Tv, BookOpen, Trash2 } from "lucide-react";

function getDetail(entry: RecentItem): string {
  if (entry.type === "film") {
    const f = Array.isArray(entry.item.film) ? entry.item.film[0] : entry.item.film;
    return f ? `${f.duration_min} min${f.year ? ` · ${f.year}` : ""}` : "";
  }
  if (entry.type === "series") {
    const s = Array.isArray(entry.item.series) ? entry.item.series[0] : entry.item.series;
    return s ? `${s.episodes_watched} ep` : "";
  }
  if (entry.type === "book") {
    return entry.item.author || "";
  }
  return "";
}

interface AdminDashboardProps {
  recentItems: RecentItem[];
}

export function AdminDashboard({ recentItems }: AdminDashboardProps) {
  const router = useRouter();
  const [filmError, setFilmError] = useState<string | null>(null);
  const [seriesError, setSeriesError] = useState<string | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleFilmSubmit(formData: FormData) {
    setFilmError(null);
    const r = await adminCreateFilm(formData);
    if (r.error) setFilmError(r.error);
    else router.refresh();
  }

  async function handleSeriesSubmit(formData: FormData) {
    setSeriesError(null);
    const r = await adminCreateSeries(formData);
    if (r.error) setSeriesError(r.error);
    else router.refresh();
  }

  async function handleBookSubmit(formData: FormData) {
    setBookError(null);
    const r = await adminCreateBook(formData);
    if (r.error) setBookError(r.error);
    else router.refresh();
  }

  async function handleDelete(id: string, type: "film" | "series" | "book") {
    setDeleting(id);
    await adminDeleteContent(id, type);
    router.refresh();
    setDeleting(null);
  }

  const inputClass =
    "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm";
  const labelClass = "block text-xs font-medium text-[var(--muted)] mt-2 first:mt-0";
  const selectClass =
    "rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm";

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="mt-1 text-[var(--muted)]">Quick create and recent items</p>
      </header>

      {/* Quick Create Forms */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add Film */}
        <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Film className="h-5 w-5 text-[var(--accent)]" />
            Add Film
          </h2>
          <form action={handleFilmSubmit} className="mt-3 space-y-2">
            <label className={labelClass}>Title *</label>
            <input name="title" required className={inputClass} />
            <label className={labelClass}>Year</label>
            <input name="year" type="number" min={1900} className={inputClass} />
            <label className={labelClass}>Duration (min) *</label>
            <input name="duration_min" type="number" required min={1} className={inputClass} />
            <label className={labelClass}>Rating (0-10)</label>
            <input name="rating" type="number" step="0.1" min={0} max={10} className={inputClass} />
            <label className={labelClass}>Review</label>
            <textarea name="review" rows={2} className={inputClass} />
            <label className={labelClass}>Visibility</label>
            <select name="visibility" className={selectClass}>
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
            {filmError && <p className="text-xs text-red-500">{filmError}</p>}
            <button
              type="submit"
              className="mt-3 w-full rounded-lg bg-[var(--accent)] py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Add Film
            </button>
          </form>
        </section>

        {/* Add Series */}
        <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Tv className="h-5 w-5 text-[var(--accent)]" />
            Add Series
          </h2>
          <form action={handleSeriesSubmit} className="mt-3 space-y-2">
            <label className={labelClass}>Title *</label>
            <input name="title" required className={inputClass} />
            <label className={labelClass}>Episodes watched</label>
            <input name="episodes_watched" type="number" min={0} defaultValue={0} className={inputClass} />
            <label className={labelClass}>Avg episode (min)</label>
            <input name="avg_episode_min" type="number" min={1} className={inputClass} />
            <label className={labelClass}>Rating (0-10)</label>
            <input name="rating" type="number" step="0.1" min={0} max={10} className={inputClass} />
            <label className={labelClass}>Review</label>
            <textarea name="review" rows={2} className={inputClass} />
            <label className={labelClass}>Visibility</label>
            <select name="visibility" className={selectClass}>
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
            {seriesError && <p className="text-xs text-red-500">{seriesError}</p>}
            <button
              type="submit"
              className="mt-3 w-full rounded-lg bg-[var(--accent)] py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Add Series
            </button>
          </form>
        </section>

        {/* Add Book */}
        <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <BookOpen className="h-5 w-5 text-[var(--accent)]" />
            Add Book
          </h2>
          <form action={handleBookSubmit} className="mt-3 space-y-2">
            <label className={labelClass}>Title *</label>
            <input name="title" required className={inputClass} />
            <label className={labelClass}>Author</label>
            <input name="author" className={inputClass} />
            <label className={labelClass}>Pages</label>
            <input name="pages" type="number" min={1} className={inputClass} />
            <label className={labelClass}>Rating (0-10)</label>
            <input name="rating" type="number" step="0.1" min={0} max={10} className={inputClass} />
            <label className={labelClass}>Quote</label>
            <textarea name="quote" rows={2} className={inputClass} />
            <label className={labelClass}>Review</label>
            <textarea name="review" rows={2} className={inputClass} />
            <label className={labelClass}>Visibility</label>
            <select name="visibility" className={selectClass}>
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
            {bookError && <p className="text-xs text-red-500">{bookError}</p>}
            <button
              type="submit"
              className="mt-3 w-full rounded-lg bg-[var(--accent)] py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Add Book
            </button>
          </form>
        </section>
      </div>

      {/* Recent Items */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent Items</h2>
        {recentItems.length === 0 ? (
          <p className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] py-8 text-center text-[var(--muted)]">
            No items yet. Create one above.
          </p>
        ) : (
          <div className="space-y-2">
            {recentItems.map((entry) => (
              <div
                key={entry.item.id}
                className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {entry.type === "film" && <Film className="h-4 w-4 text-[var(--muted)]" />}
                  {entry.type === "series" && <Tv className="h-4 w-4 text-[var(--muted)]" />}
                  {entry.type === "book" && <BookOpen className="h-4 w-4 text-[var(--muted)]" />}
                  <div>
                    <p className="font-medium">{entry.item.title}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {entry.type} · {getDetail(entry)} · {entry.item.visibility}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(entry.item.id, entry.type)}
                  disabled={deleting === entry.item.id}
                  className="rounded p-1.5 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
