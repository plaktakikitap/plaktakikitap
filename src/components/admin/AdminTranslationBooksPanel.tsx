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
} from "@/app/secretgate/actions";

export function AdminTranslationBooksPanel({ books }: { books: TranslationBookRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const sorted = [...books].sort(
    (a, b) =>
      (a.is_released === b.is_released ? 0 : a.is_released ? -1 : 1) || a.order_index - b.order_index
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
    setShowForm(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setError(null);
    setLoading(true);
    try {
      const result = await adminDeleteTranslationBook(id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
      setConfirmDeleteId(null);
    }
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
    void handleReorder(next);
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
    <div className="space-y-4">
      {error ? <p className="admin-error">{error}</p> : null}

      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        className="flex w-full items-center gap-2 rounded-xl border border-[#e8e0d4] bg-[#faf7f2] px-4 py-3 text-sm font-medium text-[#1a1612] transition-colors hover:border-[#b8934a]/30 hover:bg-[#b8934a]/5"
      >
        <Plus className={`h-4 w-4 text-[#b8934a] transition-transform ${showForm ? "rotate-45" : ""}`} />
        Yeni kitap ekle
      </button>

      {showForm ? (
        <form onSubmit={handleCreate} className="admin-bento-card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <div className="sm:col-span-2">
            <label className="admin-label">Başlık *</label>
            <input name="title" required className="admin-input" placeholder="Kitap adı" />
          </div>
          <div>
            <label className="admin-label">Orijinal yazar *</label>
            <input name="original_author" required className="admin-input" placeholder="Yazar" />
          </div>
          <div>
            <label className="admin-label">Yayınevi *</label>
            <input name="publisher" required className="admin-input" placeholder="Yayınevi" />
          </div>
          <div>
            <label className="admin-label">Yıl</label>
            <input name="year" type="number" min="1900" max="2100" className="admin-input" placeholder="2024" />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Kapak görseli</label>
            <AdminImageUpload name="cover_url" placeholder="Kapak yükle" />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Amazon URL</label>
            <input name="amazon_url" type="text" className="admin-input" placeholder="https://..." />
          </div>
          <div>
            <label className="admin-label">Kaynak dil</label>
            <input name="source_lang" className="admin-input" placeholder="EN" maxLength={10} />
          </div>
          <div>
            <label className="admin-label">Hedef dil</label>
            <input name="target_lang" className="admin-input" placeholder="TR" maxLength={10} />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Çevirmenin notu</label>
            <textarea name="translator_note" rows={3} className="admin-input min-h-[5rem]" />
          </div>
          <div>
            <label className="admin-label">Durum rozeti</label>
            <input name="status_badge" className="admin-input" placeholder="Çok Yakında" />
            <p className="admin-hint">Boşsa yayında olmayanlarda “Çok Yakında” yazılır.</p>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              id="is_released_new"
              name="is_released"
              defaultChecked
              className="h-4 w-4 rounded border-[#e8e0d4]"
            />
            <label htmlFor="is_released_new" className="text-sm text-[#6b6158]">
              Yayında (kapalıysa tamamlanma % gösterilir)
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Tamamlanma %</label>
            <input
              name="completion_percentage"
              type="number"
              min={0}
              max={100}
              defaultValue={0}
              className="admin-input"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={loading} className="admin-btn-gold disabled:opacity-50">
              Ekle
            </button>
          </div>
        </form>
      ) : null}

      {sorted.length === 0 ? (
        <p className="py-4 text-sm text-[#1a1612]/40">Henüz kitap yok.</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((b) => (
            <li
              key={b.id}
              draggable
              onDragStart={(e) => handleDragStart(e, b.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, b.id)}
              className={`group flex items-center gap-3 rounded-xl border border-[#e8e0d4] bg-white/60 px-4 py-3 transition-all hover:border-[#d4c9bb] ${
                draggedId === b.id ? "opacity-60" : ""
              }`}
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-[#a09588]" />
              {b.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.cover_url} alt="" className="h-12 w-8 shrink-0 rounded object-cover shadow-sm" />
              ) : (
                <div className="h-12 w-8 shrink-0 rounded bg-[#b8934a]/10" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#1a1612]">{b.title}</p>
                <p className="mt-0.5 truncate text-xs text-[#a09588]">
                  {b.original_author}
                  {[b.publisher, b.year].filter(Boolean).length
                    ? ` · ${[b.publisher, b.year].filter(Boolean).join(" · ")}`
                    : ""}
                  {!b.is_released ? (
                    <span className="ml-2 rounded-full bg-[#b8934a]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#b8934a]">
                      {b.status_badge || "Çok Yakında"}
                    </span>
                  ) : null}
                </p>
              </div>
              <div
                className={`flex shrink-0 items-center gap-1 transition-opacity ${
                  confirmDeleteId === b.id
                    ? "opacity-100"
                    : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                }`}
              >
                <Link
                  href={`/secretgate/translations/books/${b.id}/edit`}
                  className="rounded-lg p-1.5 text-[#6b6158] transition-colors hover:bg-[#1a1612]/8 hover:text-[#1a1612]"
                  aria-label="Düzenle"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                {confirmDeleteId === b.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-red-500">Emin misin?</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id)}
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
                    onClick={() => setConfirmDeleteId(b.id)}
                    className="rounded-lg p-1.5 text-[#6b6158] transition-colors hover:text-red-500"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
