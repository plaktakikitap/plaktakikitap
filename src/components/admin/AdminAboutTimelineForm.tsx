"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2, GripVertical, Pencil, Star } from "lucide-react";

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
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

export function AdminAboutTimelineForm({ entries }: { entries: TimelineEntry[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [ordered, setOrdered] = useState(entries);
  const sorted = [...ordered].sort((a, b) => a.order_index - b.order_index);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const year = (form.querySelector('[name="year_or_period"]') as HTMLInputElement)?.value ?? "";
    const text = (form.querySelector('[name="paragraph_text"]') as HTMLTextAreaElement)?.value ?? "";
    const imagesStr = (form.querySelector('[name="associated_images"]') as HTMLTextAreaElement)?.value ?? "[]";
    let images: TimelineImage[] = [];
    try {
      const parsed = JSON.parse(imagesStr);
      images = Array.isArray(parsed) ? parsed.map((x: unknown) => ({
        url: typeof x === "object" && x !== null && "url" in x ? String((x as { url: string }).url) : "",
        caption: typeof x === "object" && x !== null && "caption" in x ? String((x as { caption?: string }).caption ?? "") : undefined,
      })).filter((x) => x.url) : [];
    } catch {
      images = [];
    }

    const res = await fetch("/api/admin/about", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year_or_period: year.trim(),
        paragraph_text: text.trim(),
        associated_images: images,
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
          <label className={labelClass}>Dönem (year_or_period)</label>
          <input name="year_or_period" className={inputClass} placeholder="2015-2018 Üniversite Yılları" required />
          <label className={labelClass}>Paragraf metni (paragraph_text)</label>
          <textarea name="paragraph_text" className={inputClass} rows={4} placeholder="O döneme ait hikaye..." />
          <label className={labelClass}>
            Görseller (JSON: [&#123;&quot;url&quot;: &quot;...&quot;, &quot;caption&quot;: &quot;...&quot;&#125;])
          </label>
          <textarea
            name="associated_images"
            className={`${inputClass} font-mono text-xs`}
            rows={3}
            placeholder='[{"url":"https://...","caption":"Polaroid notu"}]'
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
  const [imagesStr, setImagesStr] = useState(JSON.stringify(entry.associated_images ?? [], null, 2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let images: TimelineImage[] = [];
    try {
      const parsed = JSON.parse(imagesStr);
      images = Array.isArray(parsed)
        ? parsed
            .map((x: unknown) => ({
              url: typeof x === "object" && x !== null && "url" in x ? String((x as { url: string }).url) : "",
              caption: typeof x === "object" && x !== null && "caption" in x ? String((x as { caption?: string }).caption ?? "") : undefined,
            }))
            .filter((x) => x.url)
        : [];
    } catch {
      images = [];
    }
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
      <textarea
        value={imagesStr}
        onChange={(e) => setImagesStr(e.target.value)}
        className={`${inputClass} font-mono text-xs`}
        rows={4}
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
