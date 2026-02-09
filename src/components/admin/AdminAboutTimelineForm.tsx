"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, GripVertical, Pencil, Star, Upload, Loader2 } from "lucide-react";

export type TimelineImage = { url: string; caption?: string };

export type TimelineEntry = {
  id: string;
  year_or_period: string;
  paragraph_text: string;
  associated_images: TimelineImage[];
  order_index: number;
  is_highlight: boolean;
};

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

/** Cihazdan fotoğraf yükleme — dosya seçici ile. */
function AboutTimelineImageUpload({
  value,
  onChange,
  disabled,
}: {
  value: TimelineImage[];
  onChange: (images: TimelineImage[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadError(null);
    setUploading(true);
    const next = [...value];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      const form = new FormData();
      form.set("file", file);
      form.set("folder", "about");
      const res = await fetch("/api/admin/upload/image", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        next.push({ url: data.url, caption: "" });
      } else {
        setUploadError(data.error ?? "Yükleme başarısız");
      }
    }
    onChange(next);
    setUploading(false);
    e.target.value = "";
  }

  function removeAt(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function setCaption(i: number, caption: string) {
    const next = value.slice();
    next[i] = { ...next[i], caption: caption || undefined };
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Yükleniyor…" : "Bilgisayardan veya telefondan görsel ekle"}
        </button>
        {uploadError && <span className="text-xs text-red-500">{uploadError}</span>}
      </div>
      {value.length > 0 && (
        <ul className="space-y-3">
          {value.map((img, i) => (
            <li key={i} className="flex gap-3 rounded-lg border border-[var(--card-border)] bg-white/80 p-2">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-neutral-100">
                <Image src={img.url} alt="" width={80} height={80} className="h-full w-full object-cover" unoptimized />
              </div>
              <div className="min-w-0 flex-1">
                <input
                  type="text"
                  value={img.caption ?? ""}
                  onChange={(e) => setCaption(i, e.target.value)}
                  className="w-full rounded border border-[var(--card-border)] bg-white px-2 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400"
                  placeholder="Görsel açıklaması (isteğe bağlı)"
                />
              </div>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="shrink-0 rounded p-1.5 text-red-500 hover:bg-red-500/10"
                title="Kaldır"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminAboutTimelineForm({ entries }: { entries: TimelineEntry[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [ordered, setOrdered] = useState(entries);
  const [newEntryImages, setNewEntryImages] = useState<TimelineImage[]>([]);
  const sorted = [...ordered].sort((a, b) => a.order_index - b.order_index);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const year = (form.querySelector('[name="year_or_period"]') as HTMLInputElement)?.value ?? "";
    const text = (form.querySelector('[name="paragraph_text"]') as HTMLTextAreaElement)?.value ?? "";

    const res = await fetch("/api/admin/about", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year_or_period: year.trim(),
        paragraph_text: text.trim(),
        associated_images: newEntryImages,
        order_index: sorted.length,
        is_highlight: false,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Hata");
      return;
    }
    form.reset();
    setNewEntryImages([]);
    router.refresh();
  }

  async function handleUpdate(id: string, data: Partial<TimelineEntry>) {
    setLoading(true);
    const res = await fetch(`/api/admin/about/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Hata");
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu girişi silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    await fetch(`/api/admin/about/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  async function handleReorder(newOrder: TimelineEntry[]) {
    setOrdered(newOrder);
    for (let i = 0; i < newOrder.length; i++) {
      await fetch(`/api/admin/about/${newOrder[i].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_index: i }),
      });
    }
    router.refresh();
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDraggedId(null);
    const fromId = e.dataTransfer.getData("text/plain");
    if (!fromId || fromId === targetId) return;
    const fromIdx = sorted.findIndex((x) => x.id === fromId);
    const toIdx = sorted.findIndex((x) => x.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const next = [...sorted];
    const [removed] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, removed);
    handleReorder(next);
  };

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={handleCreate} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <Plus className="h-4 w-4" />
          Yeni timeline girişi
        </h2>
        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
        <div className="grid gap-3">
          <label className={labelClass}>Dönem</label>
          <input name="year_or_period" className={inputClass} placeholder="2015-2018 Üniversite Yılları" required />
          <label className={labelClass}>Paragraf metni</label>
          <textarea name="paragraph_text" className={inputClass} rows={4} placeholder="O döneme ait hikaye..." />
          <label className={labelClass}>Görseller</label>
          <AboutTimelineImageUpload
            value={newEntryImages}
            onChange={setNewEntryImages}
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading} className="mt-4 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50">
          Ekle
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="font-medium">Mevcut girişler (sürükle-bırak ile sırala)</h2>
        {sorted.map((entry) => (
          <div
            key={entry.id}
            draggable
            onDragStart={(e) => handleDragStart(e, entry.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, entry.id)}
            className={`flex items-start gap-3 rounded-xl border p-4 ${
              entry.is_highlight ? "border-amber-500/50 bg-amber-500/5" : "border-[var(--card-border)] bg-[var(--card)]/30"
            }`}
          >
            <GripVertical className="mt-1 h-5 w-5 shrink-0 cursor-grab text-[var(--muted)]" />
            <div className="min-w-0 flex-1">
              {editingId === entry.id ? (
                <EditForm
                  entry={entry}
                  onSave={(data) => handleUpdate(entry.id, data)}
                  onCancel={() => setEditingId(null)}
                  loading={loading}
                />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{entry.year_or_period}</span>
                    {entry.is_highlight && <Star className="h-4 w-4 fill-amber-500 text-amber-500" />}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{entry.paragraph_text}</p>
                  {entry.associated_images?.length > 0 && (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {entry.associated_images.length} görsel
                    </p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(entry.id)}
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-[var(--muted)] hover:bg-[var(--background)]"
                    >
                      <Pencil className="h-3 w-3" /> Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(entry.id, { is_highlight: !entry.is_highlight })}
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-[var(--muted)] hover:bg-[var(--background)]"
                    >
                      <Star className={`h-3 w-3 ${entry.is_highlight ? "fill-amber-500 text-amber-500" : ""}`} /> Highlight
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" /> Sil
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditForm({
  entry,
  onSave,
  onCancel,
  loading,
}: {
  entry: TimelineEntry;
  onSave: (data: Partial<TimelineEntry>) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [year, setYear] = useState(entry.year_or_period);
  const [text, setText] = useState(entry.paragraph_text);
  const [images, setImages] = useState<TimelineImage[]>(entry.associated_images ?? []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ year_or_period: year.trim(), paragraph_text: text.trim(), associated_images: images });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className={inputClass}
        placeholder="Dönem"
        required
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={inputClass}
        rows={3}
        placeholder="Paragraf"
      />
      <label className={labelClass}>Görseller</label>
      <AboutTimelineImageUpload
        value={images}
        onChange={setImages}
        disabled={loading}
      />
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="rounded bg-[var(--accent)] px-3 py-1.5 text-sm text-white">
          Kaydet
        </button>
        <button type="button" onClick={onCancel} className="rounded border px-3 py-1.5 text-sm">
          İptal
        </button>
      </div>
    </form>
  );
}
