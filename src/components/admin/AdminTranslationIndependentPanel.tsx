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
} from "@/app/admin/actions";

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

export function AdminTranslationIndependentPanel({ items }: { items: TranslationIndependentRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    const result = await adminDeleteTranslationIndependent(id);
    setLoading(false);
    if (result?.error) setError(result.error);
    else router.refresh();
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
    handleReorder(next);
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
    <div className="space-y-8">
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <Plus className="h-4 w-4" />
          Bağımsız çeviri ekle
        </h2>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Başlık *</label>
            <input name="title" required className={inputClass} placeholder="Proje başlığı" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Açıklama</label>
            <textarea name="description" rows={2} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Yıl</label>
            <input name="year" type="number" className={inputClass} placeholder="2024" />
          </div>
          <div>
            <label className={labelClass}>Etiketler (virgülle: academia, felsefe)</label>
            <input name="tags" className={inputClass} placeholder="academia, edebiyat" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>external_url</label>
            <input name="external_url" type="url" className={inputClass} placeholder="https://..." />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>PDF (URL veya dosya yükle)</label>
            <input name="file_url" type="url" className={inputClass} placeholder="https://..." />
            <input name="file_file" type="file" accept=".pdf,application/pdf" className="mt-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={loading} className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50">
              Ekle
            </button>
          </div>
        </form>
      </section>
      <section>
        <h2 className="mb-4 font-medium">Bağımsız çeviriler ({items.length})</h2>
        {sorted.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Henüz öğe yok.</p>
        ) : (
          <div className="space-y-3">
            {sorted.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, item.id)}
                className={`flex items-center gap-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)]/30 px-4 py-3 ${draggedId === item.id ? "opacity-60" : ""}`}
              >
                <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-[var(--muted)]" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-[var(--muted)] line-clamp-1">{item.description || item.external_url || "—"}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/translations/independent/${item.id}/edit`} className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--background)]" aria-label="Düzenle">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button type="button" onClick={() => handleDelete(item.id)} disabled={loading} className="rounded p-1.5 text-red-600 hover:bg-red-500/10" aria-label="Sil">
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
