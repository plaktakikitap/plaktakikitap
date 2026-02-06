"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { AdminImageUpload } from "./AdminImageUpload";

type ItemType = "video" | "audio_book";

interface Item {
  id: string;
  type: ItemType;
  title: string;
  description: string | null;
  youtube_url: string;
  youtube_video_id: string;
  custom_thumbnail_url: string | null;
  tags: string[];
  duration_min: number | null;
  is_featured: boolean;
  order_index: number;
  created_at: string;
}

const inputClass = "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

export function AdminPlaktakiKitapItemsManager() {
  const router = useRouter();
  const [tab, setTab] = useState<ItemType>("video");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [orderValues, setOrderValues] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/admin/plaktaki-kitap/items")
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        const o: Record<string, number> = {};
        (Array.isArray(data) ? data : []).forEach((i: Item) => { o[i.id] = i.order_index; });
        setOrderValues(o);
      })
      .catch(() => setItems([]));
  }, []);

  const list = items.filter((i) => i.type === tab);
  const sortedList = [...list].sort((a, b) => a.order_index - b.order_index);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const title = (fd.get("title") as string)?.trim() ?? "";
    const youtube_url = (fd.get("youtube_url") as string)?.trim() ?? "";
    if (!youtube_url) {
      setError("YouTube URL gerekli.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/plaktaki-kitap/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: tab,
          title: title || "Untitled",
          description: (fd.get("description") as string)?.trim() || null,
          youtube_url,
          custom_thumbnail_url: tab === "video" ? (fd.get("custom_thumbnail_url") as string)?.trim() || null : undefined,
          tags: (fd.get("tags") as string)?.trim() ? (fd.get("tags") as string).trim().split(",").map((t) => t.trim()).filter(Boolean) : [],
          is_featured: fd.get("is_featured") === "on",
          order_index: 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Eklenemedi.");
        return;
      }
      setItems((prev) => [...prev, data]);
      (e.target as HTMLFormElement).reset();
      setOrderValues((prev) => ({ ...prev, [data.id]: data.order_index }));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string, payload: Partial<Item>) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/plaktaki-kitap/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Güncellenemedi.");
        return;
      }
      const data = await res.json();
      setItems((prev) => prev.map((i) => (i.id === id ? data : i)));
      setEditingId(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/plaktaki-kitap/items/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Silinemedi.");
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
      setEditingId(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleReorder() {
    const orderedIds = [...sortedList]
      .sort((a, b) => (orderValues[a.id] ?? a.order_index) - (orderValues[b.id] ?? b.order_index))
      .map((i) => i.id);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plaktaki-kitap/items/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) {
        setError("Sıra kaydedilemedi.");
        return;
      }
      setOrderDirty(false);
      const updated = await fetch("/api/admin/plaktaki-kitap/items").then((r) => r.json());
      setItems(Array.isArray(updated) ? updated : items);
      const o: Record<string, number> = {};
      (Array.isArray(updated) ? updated : []).forEach((i: Item) => { o[i.id] = i.order_index; });
      setOrderValues(o);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6">
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("video")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === "video" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--secondary)] text-[var(--secondary-foreground)]"}`}
        >
          Videolar
        </button>
        <button
          type="button"
          onClick={() => setTab("audio_book")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === "audio_book" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--secondary)] text-[var(--secondary-foreground)]"}`}
        >
          Sesli Kitaplar
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleCreate} className="mb-6 space-y-3">
        <h4 className="font-medium">Yeni {tab === "video" ? "video" : "sesli kitap"} ekle</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{tab === "video" ? "Başlık" : "Kitap adı"} *</label>
            <input name="title" type="text" required placeholder={tab === "video" ? "Video başlığı" : "Kitap adı"} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>YouTube URL *</label>
            <input name="youtube_url" type="url" required placeholder="https://www.youtube.com/watch?v=..." className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Açıklama / Özet</label>
          <textarea name="description" rows={2} className={inputClass} />
        </div>
        {tab === "video" && (
          <div>
            <label className={labelClass}>Özel thumbnail</label>
            <AdminImageUpload
              name="custom_thumbnail_url"
              placeholder="Boş bırak = YouTube kapağı kullanılır"
            />
          </div>
        )}
        <div>
          <label className={labelClass}>Etiketler (virgülle)</label>
          <input name="tags" type="text" placeholder="edebiyat, roman" className={inputClass} />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input name="is_featured" type="checkbox" className="rounded" />
            <span className="text-sm">Öne çıkan</span>
          </label>
          <button type="submit" disabled={loading} className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50">
            <Plus className="mr-1 inline h-4 w-4" /> Ekle
          </button>
        </div>
      </form>

      <div className="border-t border-[var(--card-border)] pt-4">
        <h4 className="mb-3 font-medium">Sıra</h4>
        <p className="mb-3 text-xs text-[var(--muted)]">order_index: küçük = üstte. Değiştirip &quot;Sırayı kaydet&quot;e tıklayın.</p>
        <ul className="space-y-2">
          {sortedList.map((item) => (
            <li key={item.id} className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 p-2">
              <GripVertical className="h-4 w-4 text-[var(--muted)]" />
              <input
                type="number"
                value={orderValues[item.id] ?? item.order_index}
                onChange={(e) => {
                  setOrderValues((prev) => ({ ...prev, [item.id]: parseInt(e.target.value, 10) || 0 }));
                  setOrderDirty(true);
                }}
                className="w-16 rounded border border-[var(--card-border)] px-2 py-1 text-sm"
              />
              {editingId === item.id ? (
                <ItemEditForm
                  item={item}
                  onSave={(p) => handleUpdate(item.id, p)}
                  onCancel={() => setEditingId(null)}
                  disabled={loading}
                  isVideo={tab === "video"}
                />
              ) : (
                <>
                  <span className="min-w-0 flex-1 truncate text-sm">{item.title || "—"}</span>
                  <button type="button" onClick={() => setEditingId(item.id)} className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]" aria-label="Düzenle">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(item.id)} className="rounded p-1.5 text-[var(--muted)] hover:bg-red-500/20 hover:text-red-600" aria-label="Sil">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
        {sortedList.length > 0 && orderDirty && (
          <button type="button" onClick={handleReorder} disabled={loading} className="mt-3 rounded bg-amber-600 px-3 py-1.5 text-sm text-white disabled:opacity-50">
            Sırayı kaydet
          </button>
        )}
      </div>
    </div>
  );
}

function ItemEditForm({
  item,
  onSave,
  onCancel,
  disabled,
  isVideo,
}: {
  item: Item;
  onSave: (p: Partial<Item>) => void;
  onCancel: () => void;
  disabled: boolean;
  isVideo: boolean;
}) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [youtube_url, setYoutubeUrl] = useState(item.youtube_url);
  const [custom_thumbnail_url, setCustomThumbnailUrl] = useState(item.custom_thumbnail_url ?? "");
  const [tags, setTags] = useState(item.tags?.join(", ") ?? "");
  const [is_featured, setIsFeatured] = useState(item.is_featured);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          title,
          description: description || null,
          youtube_url,
          custom_thumbnail_url: isVideo ? (custom_thumbnail_url || null) : null,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          is_featured,
        });
      }}
      className="ml-2 flex flex-1 flex-wrap items-end gap-2"
    >
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık" className="min-w-[120px] max-w-[200px] rounded border px-2 py-1 text-sm" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Açıklama" rows={1} className="min-w-[140px] max-w-[220px] rounded border px-2 py-1 text-sm" />
      <input type="url" value={youtube_url} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="YouTube URL" className="min-w-[180px] max-w-[240px] rounded border px-2 py-1 text-sm" />
      {isVideo && (
        <input type="url" value={custom_thumbnail_url} onChange={(e) => setCustomThumbnailUrl(e.target.value)} placeholder="Thumbnail URL" className="min-w-[120px] max-w-[180px] rounded border px-2 py-1 text-sm" />
      )}
      <label className="flex items-center gap-1 text-sm">
        <input type="checkbox" checked={is_featured} onChange={(e) => setIsFeatured(e.target.checked)} />
        Öne çıkan
      </label>
      <button type="submit" disabled={disabled} className="rounded bg-[var(--primary)] px-2 py-1 text-sm text-[var(--primary-foreground)]">Kaydet</button>
      <button type="button" onClick={onCancel} className="rounded border px-2 py-1 text-sm">İptal</button>
    </form>
  );
}
