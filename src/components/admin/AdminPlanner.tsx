"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  adminCreatePlannerEntry,
  adminUpdatePlannerEntry,
  adminDeletePlannerEntry,
  adminAddPlannerMedia,
  adminDeletePlannerMedia,
} from "@/app/admin/actions";
import type { PlannerEntryWithMedia } from "@/lib/db/queries";
import { getVideoEmbedUrl } from "@/lib/utils/embed";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Image as ImageIcon,
  Video,
  Link2,
  Trash2,
} from "lucide-react";

type EntryWithVisibility = PlannerEntryWithMedia & { visibility: string };

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

interface AdminPlannerProps {
  entries: EntryWithVisibility[];
}

export function AdminPlanner({ entries }: AdminPlannerProps) {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const entryByDate = useMemo(() => {
    const map: Record<string, EntryWithVisibility> = {};
    for (const e of entries) {
      map[e.date] = e;
    }
    return map;
  }, [entries]);

  const selectedEntry = selectedDate ? entryByDate[selectedDate] : null;

  const daysInMonth = getDaysInMonth(year, month);
  const startDow = new Date(year, month, 1).getDay();

  const cells = [];
  for (let i = 0; i < startDow; i++) {
    cells.push(<div key={`pad-${i}`} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const hasEntry = !!entryByDate[dateStr];
    cells.push(
      <button
        key={d}
        onClick={() => setSelectedDate(dateStr)}
        className={`flex flex-col items-center justify-center rounded py-2 text-sm transition hover:bg-[var(--accent-soft)]/50 ${
          hasEntry ? "bg-[var(--accent-soft)]/30 font-medium" : "text-[var(--foreground)]"
        }`}
      >
        {d}
        {hasEntry && (
          <span className="mt-0.5 h-1 w-1 rounded-full bg-[var(--accent)]" />
        )}
      </button>
    );
  }

  function goPrevMonth() {
    if (month <= 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (month >= 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Planner</h1>
        <p className="mt-1 text-[var(--muted)]">
          Click a day to add or edit the entry.
        </p>
      </header>

      {/* Month calendar */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={goPrevMonth}
            className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="font-editorial text-lg font-medium">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={goNextMonth}
            className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
            <div key={d} className="py-1 text-xs font-medium text-[var(--muted)]">
              {d}
            </div>
          ))}
          {cells}
        </div>
      </section>

      {/* Entry modal */}
      {selectedDate && (
        <EntryModal
          date={selectedDate}
          entry={selectedEntry ?? undefined}
          onClose={() => setSelectedDate(null)}
          onSaved={() => {
            setSelectedDate(null);
            router.refresh();
          }}
          onError={setError}
        />
      )}

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm";
const labelClass = "block text-xs font-medium text-[var(--muted)] mt-3 first:mt-0";

function MediaPreview({
  media,
  onDelete,
}: {
  media: { id: string; kind: string; url: string; caption: string | null };
  onDelete: () => void;
}) {
  const embedUrl = getVideoEmbedUrl(media.url);

  return (
    <div className="group relative overflow-hidden rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
      <div className="flex items-center gap-2 border-b border-[var(--card-border)] px-2 py-1 text-xs text-[var(--muted)]">
        {media.kind === "image" && <ImageIcon className="h-3 w-3" />}
        {media.kind === "video" && <Video className="h-3 w-3" />}
        {media.kind === "link" && <Link2 className="h-3 w-3" />}
        <span className="flex-1 truncate">{media.url}</span>
        <button
          type="button"
          onClick={onDelete}
          className="rounded p-0.5 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500"
          title="Remove"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="aspect-video bg-black">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={media.caption ?? "Video"}
            className="h-full w-full"
            allowFullScreen
          />
        ) : media.kind === "image" ? (
          <img
            src={media.url}
            alt={media.caption ?? ""}
            className="h-full w-full object-contain"
          />
        ) : media.kind === "video" ? (
          <video src={media.url} controls className="h-full w-full" />
        ) : (
          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-full items-center justify-center text-[var(--accent)] hover:underline"
          >
            {media.caption || "Open link"}
          </a>
        )}
      </div>
      {media.caption && (
        <p className="px-2 py-1 text-xs text-[var(--muted)]">{media.caption}</p>
      )}
    </div>
  );
}

function EntryModal({
  date,
  entry,
  onClose,
  onSaved,
  onError,
}: {
  date: string;
  entry: EntryWithVisibility | undefined;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string | null) => void;
}) {
  const router = useRouter();
  const [addingMedia, setAddingMedia] = useState(false);

  const [d, m, y] = date.split("-");
  const display = `${Number(d)} ${MONTH_NAMES[Number(m) - 1]} ${y}`;

  async function handleSubmit(formData: FormData) {
    onError(null);
    if (entry) {
      const r = await adminUpdatePlannerEntry(entry.id, formData);
      if (r.error) onError(r.error);
      else onSaved();
    } else {
      const r = await adminCreatePlannerEntry(formData);
      if (r.error) onError(r.error);
      else onSaved();
    }
  }

  async function handleAddMedia(formData: FormData) {
    onError(null);
    if (!entry) return;
    const r = await adminAddPlannerMedia(formData);
    if (r.error) onError(r.error);
    else {
      setAddingMedia(false);
      router.refresh();
    }
  }

  async function handleDeleteMedia(id: string) {
    await adminDeletePlannerMedia(id);
    router.refresh();
  }

  async function handleDelete() {
    if (!entry || !confirm("Delete this entry?")) return;
    await adminDeletePlannerEntry(entry.id);
    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--card-border)] bg-[var(--card)] px-4 py-3">
          <h3 className="font-editorial font-medium">
            {entry ? "Edit" : "Add"} — {display}
          </h3>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={handleSubmit} className="p-4">
          <input type="hidden" name="date" value={date} />
          <label className={labelClass}>Title</label>
          <input
            name="title"
            className={inputClass}
            defaultValue={entry?.title ?? ""}
            placeholder="Entry title"
          />
          <label className={labelClass}>Body</label>
          <textarea
            name="body"
            rows={5}
            className={inputClass}
            defaultValue={entry?.body ?? ""}
            placeholder="Journal text..."
          />
          <label className={labelClass}>Visibility</label>
          <select
            name="visibility"
            className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
            defaultValue={entry?.visibility ?? "private"}
          >
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
            <option value="public">Public</option>
          </select>

          {entry && (
            <>
              <label className={labelClass}>Media</label>
              {entry.media.length > 0 && (
                <div className="mb-2 grid gap-2 sm:grid-cols-2">
                  {entry.media.map((m) => (
                    <MediaPreview
                      key={m.id}
                      media={m}
                      onDelete={() => handleDeleteMedia(m.id)}
                    />
                  ))}
                </div>
              )}
              {addingMedia ? (
                <form action={handleAddMedia} className="mb-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-3">
                  <input type="hidden" name="planner_entry_id" value={entry.id} />
                  <label className={labelClass}>Kind</label>
                  <select
                    name="kind"
                    className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="link">Link (YouTube, Vimeo, etc.)</option>
                  </select>
                  <label className={labelClass}>URL *</label>
                  <input name="url" type="url" required className={inputClass} />
                  <label className={labelClass}>Caption</label>
                  <input name="caption" className={inputClass} />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm text-white"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingMedia(false)}
                      className="rounded-lg border px-3 py-1.5 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingMedia(true)}
                  className="mb-4 text-sm text-[var(--accent)] hover:underline"
                >
                  + Add media URL
                </button>
              )}
            </>
          )}

          <div className="mt-6 flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
            >
              {entry ? "Save" : "Create"}
            </button>
            {entry && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg border border-red-500/50 px-4 py-2 text-sm text-red-600 hover:bg-red-500/10"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
