"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { PlannerDaySummary, PlannerEntryWithMedia, PlannerDayEntry } from "@/lib/planner";
import { AdminPlannerDecor } from "./AdminPlannerDecor";
import { AdminPlannerMessySettings } from "./AdminPlannerMessySettings";
import { AdminPlannerCanvas } from "./AdminPlannerCanvas";
import { ChevronLeft, ChevronRight, X, Upload, Paperclip, Plus, Eraser } from "lucide-react";

const MONTH_NAMES_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstWeekday(year: number, month: number) {
  const js = new Date(year, month, 1).getDay();
  return (js + 6) % 7;
}

export function AdminPlanner() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [summary, setSummary] = useState<PlannerDaySummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/planner/entries?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => setSummary([]));
  }, [year, month]);

  const hasEntry: Record<string, boolean> = {};
  for (const s of summary) {
    if (s.entryCount > 0) hasEntry[s.date] = true;
  }

  const daysInMonth = getDaysInMonth(year, month);
  const start = firstWeekday(year, month);

  const cells = [];
  for (let i = 0; i < start; i++) {
    cells.push(<div key={`pad-${i}`} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push(
      <button
        key={d}
        type="button"
        onClick={() => setSelectedDate(dateStr)}
        className={`flex flex-col items-center justify-center rounded py-2 text-sm text-white transition hover:bg-amber-500/20 ${
          hasEntry[dateStr] ? "bg-amber-500/20 font-medium" : ""
        }`}
        aria-label={`${d} — entry ekle/düzenle`}
      >
        {d}
        {hasEntry[dateStr] && (
          <span className="mt-0.5 h-1 w-1 rounded-full bg-amber-400" />
        )}
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">Planner</h1>
        <p className="mt-1 text-white/70">
          Takvimden gün seç, o güne entry ekle. Her entry için: summary_quote (takvimde görünen özet), attachment_type (ataşlı/yapıştırma/zımba), sticker_selection (dijital sticker&apos;lar).
        </p>
      </header>

      <section className="rounded-xl border border-white/20 bg-white/5 p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMonth((m) => (m <= 0 ? 11 : m - 1))}
            className="rounded p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Önceki ay"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="font-medium text-white">
            {MONTH_NAMES_TR[month]} {year}
          </h2>
          <button
            type="button"
            onClick={() => setMonth((m) => (m >= 11 ? 0 : m + 1))}
            className="rounded p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Sonraki ay"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
            <div key={d} className="py-1 text-xs font-medium text-white/60">
              {d}
            </div>
          ))}
          {cells}
        </div>
      </section>

      <AdminPlannerMessySettings year={year} month={month + 1} />
      <AdminPlannerCanvas year={year} monthIndex={month} />
      <AdminPlannerDecor year={year} monthIndex={month} />

      {selectedDate && (
        <PlannerDateModal
          date={selectedDate}
          onClose={() => {
            setSelectedDate(null);
            setError(null);
          }}
          onSaved={() => {
            setSelectedDate(null);
            setError(null);
            router.push(`/admin/planner?toast=saved&msg=${encodeURIComponent("Notun ajandaya iğnelendi! ✨")}`);
            router.refresh();
            fetch(`/api/planner/entries?year=${year}&month=${month}`)
              .then((r) => r.json())
              .then(setSummary)
              .catch(() => {});
          }}
          onShowToast={() => {
            router.push(`/admin/planner?toast=saved&msg=${encodeURIComponent("Notun ajandaya iğnelendi! ✨")}`);
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

const inputClass = "w-full rounded-lg border border-[var(--card-border)] bg-white px-3 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-500";
const labelClass = "block text-xs font-medium text-white/80 mt-3 first:mt-0";

const ATTACHMENT_OPTIONS = [
  { value: "", label: "Yok" },
  { value: "standard_clip", label: "Metalik ataş (standard_clip)" },
  { value: "colorful_clip", label: "Neon renkli ataş (colorful_clip)" },
  { value: "binder_clip", label: "Siyah mandal (binder_clip)" },
  { value: "staple", label: "Zımba teli (staple)" },
] as const;

const STICKER_HINTS = "star, heart, moon, sun, flower, check, x — virgülle ayırın";

function PlannerDateModal({
  date,
  onClose,
  onSaved,
  onShowToast,
  onError,
}: {
  date: string;
  onClose: () => void;
  onSaved: () => void;
  onShowToast?: () => void;
  onError: (msg: string | null) => void;
}) {
  const [entries, setEntries] = useState<PlannerEntryWithMedia[]>([]);
  const [dayEntry, setDayEntry] = useState<PlannerDayEntry | null>(null);
  const [hasSmudge, setHasSmudge] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"list" | "create" | "edit" | "day-entry">("list");
  const [editingEntry, setEditingEntry] = useState<PlannerEntryWithMedia | null>(null);
  const [smudgeLoading, setSmudgeLoading] = useState(false);

  const [d, m, y] = date.split("-").map(Number);
  const display = `${d} ${MONTH_NAMES_TR[m - 1]} ${y}`;

  useEffect(() => {
    Promise.all([
      fetch(`/api/planner/entries/${date}`).then((r) => r.json()),
      fetch(`/api/planner/smudge/${date}`).then((r) => r.json()),
      fetch(`/api/planner/day-entries/${date}`).then((r) => r.json()),
    ])
      .then(([entriesData, smudgeData, dayEntryData]) => {
        setEntries(Array.isArray(entriesData) ? entriesData : []);
        setHasSmudge(!!smudgeData?.preset);
        setDayEntry(dayEntryData?.id ? dayEntryData : null);
        setMode(Array.isArray(entriesData) && entriesData.length > 0 ? "list" : "create");
      })
      .catch(() => {
        setEntries([]);
        setHasSmudge(false);
        setDayEntry(null);
      })
      .finally(() => setLoading(false));
  }, [date]);

  async function handleAddSmudge() {
    setSmudgeLoading(true);
    try {
      const res = await fetch(`/api/planner/smudge/${date}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) setHasSmudge(true);
    } finally {
      setSmudgeLoading(false);
    }
  }

  async function handleRemoveSmudge() {
    setSmudgeLoading(true);
    try {
      const res = await fetch(`/api/planner/smudge/${date}`, { method: "DELETE" });
      if (res.ok) setHasSmudge(false);
    } finally {
      setSmudgeLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
        <div className="rounded-xl bg-white/10 px-8 py-4 text-white" onClick={(e) => e.stopPropagation()}>
          Yükleniyor…
        </div>
      </div>
    );
  }

  if (mode === "create" || mode === "edit") {
    return (
      <EntryFormModal
        date={date}
        entry={editingEntry ?? undefined}
        onClose={() => {
          if (entries.length > 0) {
            setMode("list");
            setEditingEntry(null);
          } else {
            onClose();
          }
        }}
        onSaved={() => {
          if (editingEntry) {
            setEditingEntry(null);
            setMode("list");
            onShowToast?.();
            fetch(`/api/planner/entries/${date}`)
              .then((r) => r.json())
              .then((data) => setEntries(Array.isArray(data) ? data : []));
          } else {
            onSaved();
          }
        }}
        onError={onError}
      />
    );
  }

  if (mode === "day-entry") {
    return (
      <DayEntryFormModal
        date={date}
        display={display}
        initial={dayEntry}
        onClose={() => setMode("list")}
        onSaved={() => {
          setMode("list");
          fetch(`/api/planner/day-entries/${date}`)
            .then((r) => r.json())
            .then((data) => setDayEntry(data?.id ? data : null));
          onSaved();
        }}
        onError={onError}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl border border-white/20 bg-[#1a1f2e] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-white/20 bg-[#1a1f2e] px-4 py-3">
          <h3 className="font-medium text-white">{display} — Kayıtlar</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={hasSmudge ? handleRemoveSmudge : handleAddSmudge}
              disabled={smudgeLoading}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
                hasSmudge
                  ? "border border-white/20 text-white/70 hover:bg-white/10"
                  : "bg-[#36454F] text-white hover:bg-[#2a3640]"
              }`}
              title={hasSmudge ? "Lekeyi kaldır" : "Yazıyı dağıt (mürekkep lekesi ekle)"}
            >
              <Eraser className="h-4 w-4" />
              {hasSmudge ? "Lekeyi Kaldır" : "Yazıyı Dağıt"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingEntry(null);
                setMode("create");
              }}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-sm text-white hover:bg-amber-600"
            >
              <Plus className="h-4 w-4" />
              Yeni
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="rounded-lg border border-white/20 bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/80">Gün notu</span>
              <button
                type="button"
                onClick={() => setMode("day-entry")}
                className="text-sm text-amber-400 hover:underline"
              >
                {dayEntry ? "Düzenle" : "Ekle"}
              </button>
            </div>
            {dayEntry && (
              <div className="mt-2 text-sm text-white/90">
                {dayEntry.title && <p className="font-medium line-clamp-1">{dayEntry.title}</p>}
                {dayEntry.content && <p className="mt-0.5 line-clamp-2 text-white/70">{dayEntry.content}</p>}
                {(dayEntry.tags?.length ?? 0) > 0 && (
                  <p className="mt-1 text-xs text-white/60">{dayEntry.tags.join(", ")}</p>
                )}
              </div>
            )}
          </div>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border border-white/20 p-4 text-white/90"
            >
              <h4 className="font-medium line-clamp-1">{entry.title || "(Başlıksız)"}</h4>
              {entry.summaryQuote && (
                <p className="mt-1 text-xs text-white/60 line-clamp-2">{entry.summaryQuote}</p>
              )}
              <div className="mt-2 flex items-center gap-2">
                {entry.media.some((mm) => mm.attachmentType === "paperclip" || mm.attachmentType === "paste" || mm.attachmentType === "staple" || mm.attachmentStyle) && (
                  <span className="flex items-center gap-1 text-xs text-white/60">
                    <Paperclip className="h-3 w-3" /> Ataşlı
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditingEntry(entry);
                    setMode("edit");
                  }}
                  className="text-sm text-amber-400 hover:underline"
                >
                  Düzenle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DayEntryFormModal({
  date,
  display,
  initial,
  onClose,
  onSaved,
  onError,
}: {
  date: string;
  display: string;
  initial: PlannerDayEntry | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string | null) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [submitting, setSubmitting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/planner/upload", { method: "POST", body: form });
      const data = await res.json();
      const url = data.publicUrl || (data.path && typeof window !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/planner-media/${data.path}`
        : data.path);
      if (url) setPhotos((p) => [...p, url]);
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/planner/day-entries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          title: title.trim() || null,
          content: content.trim() || null,
          photos,
          tags: tags.trim() ? tags.split(/[\s,]+/).filter(Boolean) : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Kaydedilemedi");
        return;
      }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl border border-white/20 bg-[#1a1f2e] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-white/20 bg-[#1a1f2e] px-4 py-3">
          <h3 className="font-medium text-white">Gün notu — {display}</h3>
          <button type="button" onClick={onClose} className="rounded p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <label className={labelClass}>Başlık</label>
          <input name="title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          <label className={labelClass}>İçerik</label>
          <textarea name="content" className={inputClass + " min-h-[80px]"} value={content} onChange={(e) => setContent(e.target.value)} />
          <div>
            <label className={labelClass}>Fotoğraflar</label>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
            <button type="button" disabled={photoUploading} className="rounded border border-white/20 px-2 py-1 text-sm text-white/90 hover:bg-white/10" onClick={() => fileInputRef.current?.click()}>
              {photoUploading ? "Yükleniyor…" : "Yükle"}
            </button>
            {photos.length > 0 && (
              <ul className="mt-2 space-y-1">
                {photos.map((url, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="truncate text-[var(--accent)]">{url}</a>
                    <button type="button" className="text-red-500 hover:underline" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}>Kaldır</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <label className={labelClass}>Etiketler (virgülle ayırın)</label>
          <input name="tags" className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="etiket1, etiket2" />
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting} className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-50">
              {submitting ? "Kaydediliyor…" : "Kaydet"}
            </button>
            <button type="button" onClick={onClose} className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/90 hover:bg-white/10">
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EntryFormModal({
  date,
  entry,
  onClose,
  onSaved,
  onError,
}: {
  date: string;
  entry?: PlannerEntryWithMedia;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string | null) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [firstImagePaperclip, setFirstImagePaperclip] = useState(!!entry?.media.some((m) => m.attachmentType === "paperclip" || m.attachmentStyle));

  const [d, m, y] = date.split("-").map(Number);
  const display = `${d} ${MONTH_NAMES_TR[m - 1]} ${y}`;
  const isEdit = !!entry;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = (formData.get("title") as string)?.trim() || null;
    const content = (formData.get("content") as string)?.trim() || null;
    const tagsRaw = (formData.get("tags") as string)?.trim() || "";
    const tags = tagsRaw ? tagsRaw.split(/[\s,]+/).filter(Boolean) : [];
    const summaryQuote = (formData.get("summaryQuote") as string)?.trim() || null;
    const stickerRaw = (formData.get("stickerSelection") as string)?.trim() || "";
    const stickerSelection = stickerRaw ? stickerRaw.split(/[\s,]+/).filter(Boolean) : null;

    try {
      if (isEdit) {
        const res = await fetch(`/api/planner/entry/${entry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, tags, summaryQuote, stickerSelection }),
        });
        if (!res.ok) {
          const data = await res.json();
          onError(data.error || "Güncellenemedi");
          setSubmitting(false);
          return;
        }
        if (files.length > 0) {
          const imageFiles = files.filter((f) => f.type.startsWith("image/"));
          const videoFiles = files.filter((f) => f.type.startsWith("video/"));
          for (let i = 0; i < imageFiles.length; i++) {
            const fd = new FormData();
            fd.append("file", imageFiles[i]);
            fd.append("entryId", entry.id);
            if (i === 0 && firstImagePaperclip) {
              fd.append("attachmentType", "paperclip");
              fd.append("attachmentStyle", "standard_clip");
            }
            await fetch("/api/planner/upload", { method: "POST", body: fd });
          }
          for (const f of videoFiles) {
            const fd = new FormData();
            fd.append("file", f);
            fd.append("entryId", entry.id);
            await fetch("/api/planner/upload", { method: "POST", body: fd });
          }
        }
        for (const m of entry.media) {
          const sel = form.querySelector(`[name="media-attach-${m.id}"]`) as HTMLSelectElement;
          if (sel) {
            const val = sel.value as "" | "standard_clip" | "colorful_clip" | "binder_clip" | "staple";
            await fetch(`/api/planner/media/${m.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                attachmentStyle: val || null,
                attachmentType: val === "standard_clip" || val === "colorful_clip" ? "paperclip" : val === "staple" ? "staple" : val === "binder_clip" ? "paste" : null,
              }),
            });
          }
        }
        onSaved();
      } else {
        const createRes = await fetch("/api/planner/entry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, title, content, tags, summaryQuote, stickerSelection }),
        });
        const createData = await createRes.json();
        if (!createRes.ok) {
          onError(createData.error || "Entry oluşturulamadı");
          setSubmitting(false);
          return;
        }
        const entryId = createData.id;
        if (!entryId) {
          onSaved();
          setSubmitting(false);
          return;
        }
        const imageFiles = files.filter((f) => f.type.startsWith("image/"));
        for (let i = 0; i < imageFiles.length; i++) {
          const fd = new FormData();
          fd.append("file", imageFiles[i]);
          fd.append("entryId", entryId);
          if (i === 0 && firstImagePaperclip) {
            fd.append("attachmentType", "paperclip");
            fd.append("attachmentStyle", "standard_clip");
          }
          await fetch("/api/planner/upload", { method: "POST", body: fd });
        }
        const videoFiles = files.filter((f) => f.type.startsWith("video/"));
        for (const f of videoFiles) {
          const fd = new FormData();
          fd.append("file", f);
          fd.append("entryId", entryId);
          await fetch("/api/planner/upload", { method: "POST", body: fd });
        }
        onSaved();
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl border border-white/20 bg-[#1a1f2e] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-white/20 bg-[#1a1f2e] px-4 py-3">
          <h3 className="font-medium text-white">{isEdit ? "Entry düzenle" : "Entry ekle"} — {display}</h3>
          <button type="button" onClick={onClose} className="rounded p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <label className={labelClass}>Başlık</label>
          <input name="title" className={inputClass} placeholder="Entry başlığı" defaultValue={entry?.title ?? ""} />

          <label className={labelClass}>Özet cümle (takvimde görünür)</label>
          <input
            name="summaryQuote"
            className={inputClass}
            placeholder="Kısa özet..."
            defaultValue={entry?.summaryQuote ?? ""}
          />

          <label className={labelClass}>İçerik</label>
          <textarea name="content" rows={5} className={inputClass} placeholder="Günlük metni..." defaultValue={entry?.content ?? ""} />

          <label className={labelClass}>Etiketler (virgül veya boşlukla ayır)</label>
          <input name="tags" className={inputClass} placeholder="ör: kitap, film, not" defaultValue={entry?.tags?.join(", ") ?? ""} />

          <label className={labelClass}>Sticker seçimi (virgülle ayır: star, heart, ...)</label>
          <input
            name="stickerSelection"
            className={inputClass}
            placeholder="star, heart"
            defaultValue={entry?.stickerSelection?.join(", ") ?? ""}
          />

          <label className={labelClass}>Medya (foto / video)</label>
          <input type="file" accept="image/*,video/*" multiple className={inputClass} onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
          {files.length > 0 && (
            <p className="mt-1 text-xs text-white/60">{files.length} dosya seçildi</p>
          )}

          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-white/90">
            <input
              type="checkbox"
              checked={firstImagePaperclip}
              onChange={(e) => setFirstImagePaperclip(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            <Paperclip className="h-4 w-4 text-white/60" />
            İlk fotoğrafa ataş ekle (Metalik)
          </label>

          {isEdit && entry.media.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className={labelClass}>
                attachment_style — Ekleme tipi (mevcut medya)
              </p>
              <p className="text-[10px] text-white/60 -mt-1">
                standard_clip (metalik), colorful_clip (neon), binder_clip (siyah mandal), staple (zımba teli)
              </p>
              {entry.media.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  {m.type === "image" && (
                    <img src={m.thumbUrl || m.url} alt="" className="h-10 w-10 rounded object-cover" />
                  )}
                  <select
                    name={`media-attach-${m.id}`}
                    className={inputClass}
                    defaultValue={
                      m.attachmentStyle ??
                      (m.attachmentType === "paperclip" ? "standard_clip" : m.attachmentType === "staple" ? "staple" : m.attachmentType === "paste" ? "colorful_clip" : "")
                    }
                  >
                    {ATTACHMENT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              <Upload className="h-4 w-4" />
              {submitting ? "Kaydediliyor…" : "Kaydet"}
            </button>
            <button type="button" onClick={onClose} className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/90 hover:bg-white/10">İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
