"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Pencil, GripVertical } from "lucide-react";
import type { TranslationBookRow } from "@/types/database";
import { AdminImageUpload } from "./AdminImageUpload";
import {
  adminCreateTranslationBook,
  adminDeleteTranslationBook,
  adminReorderTranslationBooks,
} from "@/app/admin/actions";

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

export function AdminTranslationBooksPanel({ books }: { books: TranslationBookRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const sorted = [...books].sort(
    (a, b) => (a.is_released === b.is_released ? 0 : a.is_released ? -1 : 1) || a.order_index - b.order_index
  );

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("order_index", String(sorted.length));
    const result = await adminCreateTranslationBook(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu kitabı silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    const result = await adminDeleteTranslationBook(id);
    setLoading(false);
    if (result?.error) setError(result.error);
    else router.refresh();
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

  async function handleReorder(newOrder: TranslationBookRow[]) {
    setLoading(true);
    setError(null);
    const result = await adminReorderTranslationBooks(newOrder.map((b) => b.id));
    setLoading(false);
    if (result?.error) setError(result.error);
    else router.refresh();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <Plus className="h-4 w-4" />
          Yeni kitap ekle
        </h2>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Başlık *</label>
            <input name="title" required className={inputClass} placeholder="Kitap adı" />
          </div>
          <div>
            <label className={labelClass}>Orijinal yazar *</label>
            <input name="original_author" required className={inputClass} placeholder="Yazar" />
          </div>
          <div>
            <label className={labelClass}>Yayınevi *</label>
            <input name="publisher" required className={inputClass} placeholder="Yayınevi" />
          </div>
          <div>
            <label className={labelClass}>Yıl</label>
            <input name="year" type="number" min="1900" max="2100" className={inputClass} placeholder="2024" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Kapak görseli</label>
            <AdminImageUpload name="cover_url" placeholder="Kapak yükle" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Amazon URL</label>
            <input name="amazon_url" type="url" className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>Kaynak dil</label>
            <input name="source_lang" className={inputClass} placeholder="EN" maxLength={10} />
          </div>
          <div>
            <label className={labelClass}>Hedef dil</label>
            <input name="target_lang" className={inputClass} placeholder="TR" maxLength={10} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Çevirmenin notu</label>
            <textarea name="translator_note" rows={3} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>status_badge (boş = Çok Yakında)</label>
            <input name="status_badge" className={inputClass} placeholder="Çok Yakında" />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              id="is_released_new"
              name="is_released"
              defaultChecked
              className="h-4 w-4 rounded border-[var(--card-border)]"
            />
            <label htmlFor="is_released_new" className="text-sm">
              Yayında (kapalıysa completion % gösterilir)
            </label>
          </div>
          <div id="completion_new" className="sm:col-span-2">
            <label className={labelClass}>Tamamlanma % (sadece yayında değilken)</label>
            <input name="completion_percentage" type="number" min={0} max={100} defaultValue={0} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50"
            >
              Ekle
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 font-medium">Kitaplar ({books.length}) — sürükle-bırak ile sırala</h2>
        {sorted.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Henüz kitap yok.</p>
        ) : (
          <div className="space-y-3">
            {sorted.map((b) => (
              <div
                key={b.id}
                draggable
                onDragStart={(e) => handleDragStart(e, b.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, b.id)}
                className={`flex items-center gap-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)]/30 px-4 py-3 ${draggedId === b.id ? "opacity-60" : ""}`}
              >
                <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-[var(--muted)]" />
                {b.cover_url ? (
                  <img src={b.cover_url} alt="" className="h-14 w-10 rounded object-cover" />
                ) : (
                  <div className="h-14 w-10 rounded bg-[var(--muted)]/20" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{b.title}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {b.original_author} · {[b.publisher, b.year].filter(Boolean).join(" · ")}
                    {!b.is_released && (
                      <span className="ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-xs">
                        {b.status_badge || "Çok Yakında"}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/translations/books/${b.id}/edit`}
                    className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                    aria-label="Düzenle"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id)}
                    disabled={loading}
                    className="rounded p-1.5 text-red-600 hover:bg-red-500/10 disabled:opacity-50"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
