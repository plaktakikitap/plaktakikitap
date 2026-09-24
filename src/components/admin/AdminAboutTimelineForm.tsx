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
  "w-full rounded-lg border border-[#e8e0d4] bg-white px-3 py-2 text-sm text-[#1a1612] placeholder:text-[#6b6158]";
const labelClass = "mb-1 block text-sm font-medium text-[#6b6158]";

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
          className="inline-flex items-center gap-2 rounded-lg border border-[#e8e0d4] bg-white px-3 py-2 text-sm text-[#1a1612] hover:bg-[#faf7f2] disabled:opacity-50"
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
  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
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
    setShowForm(false);
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
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/about/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrdered((e) => e.filter((x) => x.id !== id));
        if (editingId === id) setEditingId(null);
        router.refresh();
      }
    } finally {
      setLoading(false);
      setConfirmDeleteId(null);
    }
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
      <div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex w-full items-center gap-2 rounded-xl border border-[#e8e0d4] bg-[#faf7f2] px-4 py-3 text-sm font-medium text-[#1a1612] transition-colors hover:border-[#b8934a]/30 hover:bg-[#b8934a]/5"
        >
          <Plus
            className={`h-4 w-4 text-[#b8934a] transition-transform ${showForm ? "rotate-45" : ""}`}
          />
          {showForm ? "Formu kapat" : "Yeni timeline girişi"}
        </button>
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mt-3 rounded-2xl border border-[#e8e0d4] bg-white/70 p-4 sm:p-5"
          >
            {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
            <div className="grid gap-3">
              <label className={labelClass}>Dönem</label>
              <input
                name="year_or_period"
                className={inputClass}
                placeholder="2015-2018 Üniversite Yılları"
                required
              />
              <label className={labelClass}>Paragraf metni</label>
              <textarea
                name="paragraph_text"
                className={inputClass}
                rows={4}
                placeholder="O döneme ait hikaye..."
              />
              <label className={labelClass}>Görseller</label>
              <AboutTimelineImageUpload
                value={newEntryImages}
                onChange={setNewEntryImages}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 rounded-lg bg-[#1a1612] px-4 py-2 text-sm text-[#faf7f2] hover:opacity-90 disabled:opacity-50"
            >
              Ekle
            </button>
          </form>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-medium text-[#1a1612]">
          Mevcut girişler (sürükle-bırak ile sırala)
        </h2>
        {sorted.map((entry) => (
          <div
            key={entry.id}
            draggable
            onDragStart={(e) => handleDragStart(e, entry.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, entry.id)}
            className={`group rounded-2xl border p-4 transition-all ${
              entry.is_highlight
                ? "border-[#b8934a]/40 bg-[#b8934a]/5 shadow-sm"
                : "border-[#e8e0d4] bg-white/60 hover:border-[#d4c9bb]"
            }`}
          >
            {editingId === entry.id ? (
              <EditForm
                entry={entry}
                onSave={(data) => handleUpdate(entry.id, data)}
                onCancel={() => setEditingId(null)}
                loading={loading}
              />
            ) : (
              <div className="flex items-start gap-3">
                <span className="mt-1 cursor-grab touch-none text-[#c8bfb4] active:cursor-grabbing">
                  <GripVertical className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-base font-semibold ${
                        entry.is_highlight ? "text-[#b8934a]" : "text-[#1a1612]"
                      }`}
                    >
                      {entry.year_or_period}
                    </span>
                    {entry.is_highlight && (
                      <span className="rounded-full bg-[#b8934a]/15 px-2 py-0.5 text-[10px] font-medium text-[#b8934a]">
                        Öne çıkan
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 overflow-hidden text-sm leading-relaxed text-[#6b6158]">
                    {entry.paragraph_text}
                  </p>
                  {entry.associated_images?.length > 0 && (
                    <p className="mt-1.5 text-xs text-[#a09588]">
                      {entry.associated_images.length} görsel
                    </p>
                  )}
                  <div
                    className={`mt-3 flex items-center gap-1 transition-opacity ${
                      confirmDeleteId === entry.id
                        ? "opacity-100"
                        : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(entry.id);
                        setConfirmDeleteId(null);
                      }}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-[#6b6158] transition-colors hover:bg-[#1a1612]/8 hover:text-[#1a1612]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdate(entry.id, {
                          is_highlight: !entry.is_highlight,
                        })
                      }
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-colors ${
                        entry.is_highlight
                          ? "text-[#b8934a] hover:bg-[#b8934a]/10"
                          : "text-[#6b6158] hover:bg-[#1a1612]/8 hover:text-[#1a1612]"
                      }`}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          entry.is_highlight ? "fill-[#b8934a]" : ""
                        }`}
                      />
                      {entry.is_highlight ? "Öne çıkan" : "Highlight"}
                    </button>
                    {confirmDeleteId === entry.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-red-500">Emin misin?</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          disabled={loading}
                          className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-medium text-[#faf7f2] hover:bg-red-600 disabled:opacity-50"
                        >
                          Sil
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-lg border border-[#e8e0d4] px-2.5 py-1 text-xs text-[#6b6158] hover:text-[#1a1612]"
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(entry.id)}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Sil
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
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
        <button type="submit" disabled={loading} className="rounded bg-[#1a1612] px-3 py-1.5 text-sm text-[#faf7f2]">
          Kaydet
        </button>
        <button type="button" onClick={onCancel} className="rounded border border-[#e8e0d4] px-3 py-1.5 text-sm text-[#1a1612]">
          İptal
        </button>
      </div>
    </form>
  );
}
