"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Pencil, GripVertical } from "lucide-react";
import type { TranslationIndependentRow } from "@/types/database";
import {
  adminCreateTranslationIndependent,
  adminDeleteTranslationIndependent,
  adminReorderTranslationIndependent,
} from "@/app/secretgate/actions";

export function AdminTranslationIndependentPanel({ items }: { items: TranslationIndependentRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const sorted = [...items].sort((a, b) => a.order_index - b.order_index);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("order_index", String(sorted.length));
    const result = await adminCreateTranslationIndependent(formData);
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
      const result = await adminDeleteTranslationIndependent(id);
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

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
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
  }

  async function handleReorder(newOrder: TranslationIndependentRow[]) {
    setLoading(true);
    setError(null);
    const result = await adminReorderTranslationIndependent(newOrder.map((i) => i.id));
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
        Bağımsız çeviri ekle
      </button>

      {showForm ? (
        <form onSubmit={handleCreate} className="admin-bento-card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <div className="sm:col-span-2">
            <label className="admin-label">Başlık *</label>
            <input name="title" required className="admin-input" placeholder="Proje başlığı" />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Açıklama</label>
            <textarea name="description" rows={2} className="admin-input min-h-[4rem]" />
          </div>
          <div>
            <label className="admin-label">Yıl</label>
            <input name="year" type="number" className="admin-input" placeholder="2024" />
          </div>
          <div>
            <label className="admin-label">Etiketler</label>
            <input name="tags" className="admin-input" placeholder="academia, edebiyat" />
            <p className="admin-hint">Virgülle ayırın.</p>
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Dış bağlantı</label>
            <input name="external_url" type="text" className="admin-input" placeholder="https://..." />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">PDF</label>
            <input name="file_url" type="text" className="admin-input" placeholder="https://..." />
            <input name="file_file" type="file" accept=".pdf,application/pdf" className="mt-2 text-sm text-[#6b6158]" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={loading} className="admin-btn-gold disabled:opacity-50">
              Ekle
            </button>
          </div>
        </form>
      ) : null}

      {sorted.length === 0 ? (
        <p className="py-4 text-sm text-[#1a1612]/40">Henüz öğe yok.</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((item) => (
            <li
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, item.id)}
              className={`group flex items-center gap-3 rounded-xl border border-[#e8e0d4] bg-white/60 px-4 py-3 transition-all hover:border-[#d4c9bb] ${
                draggedId === item.id ? "opacity-60" : ""
              }`}
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-[#a09588]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#1a1612]">{item.title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-[#a09588]">
                  {item.description || item.external_url || "—"}
                </p>
              </div>
              <div
                className={`flex shrink-0 items-center gap-1 transition-opacity ${
                  confirmDeleteId === item.id
                    ? "opacity-100"
                    : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                }`}
              >
                <Link
                  href={`/secretgate/translations/independent/${item.id}/edit`}
                  className="rounded-lg p-1.5 text-[#6b6158] transition-colors hover:bg-[#1a1612]/8 hover:text-[#1a1612]"
                  aria-label="Düzenle"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                {confirmDeleteId === item.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-red-500">Emin misin?</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
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
                    onClick={() => setConfirmDeleteId(item.id)}
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
