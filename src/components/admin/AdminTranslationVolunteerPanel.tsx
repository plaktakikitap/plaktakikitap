"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Pencil, GripVertical } from "lucide-react";
import type { TranslationVolunteerProjectRow } from "@/types/database";
import {
  adminCreateTranslationVolunteer,
  adminDeleteTranslationVolunteer,
  adminReorderTranslationVolunteer,
} from "@/app/secretgate/actions";

export function AdminTranslationVolunteerPanel({
  projects,
}: {
  projects: TranslationVolunteerProjectRow[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const sorted = [...projects].sort((a, b) => a.order_index - b.order_index);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    formData.set("order_index", String(sorted.length));
    const result = await adminCreateTranslationVolunteer(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    form.reset();
    setShowForm(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setError(null);
    setLoading(true);
    try {
      const result = await adminDeleteTranslationVolunteer(id);
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

  async function handleReorder(newOrder: TranslationVolunteerProjectRow[]) {
    setLoading(true);
    setError(null);
    const result = await adminReorderTranslationVolunteer(newOrder.map((p) => p.id));
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
        Gönüllü proje ekle
      </button>

      {showForm ? (
        <form onSubmit={handleCreate} className="admin-bento-card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <div className="sm:col-span-2">
            <label className="admin-label">Kurum adı *</label>
            <input name="org_name" required className="admin-input" placeholder="Felsefelog" />
          </div>
          <div>
            <label className="admin-label">Rol</label>
            <input name="role_title" className="admin-input" placeholder="Gönüllü çevirmen" />
          </div>
          <div>
            <label className="admin-label">Yıllar</label>
            <input name="years" className="admin-input" placeholder="2022–2023" />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Açıklama</label>
            <textarea name="description" rows={3} className="admin-input min-h-[5rem]" />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Öne çıkanlar</label>
            <textarea name="highlights" rows={4} className="admin-input min-h-[6rem]" placeholder="Her satıra bir madde" />
            <p className="admin-hint">Her satır ayrı madde olur.</p>
          </div>
          <div>
            <label className="admin-label">Website</label>
            <input name="website_url" type="text" className="admin-input" placeholder="https://..." />
          </div>
          <div>
            <label className="admin-label">Instagram</label>
            <input name="instagram_url" type="text" className="admin-input" placeholder="https://..." />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">X</label>
            <input name="x_url" type="text" className="admin-input" placeholder="https://..." />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={loading} className="admin-btn-gold disabled:opacity-50">
              Ekle
            </button>
          </div>
        </form>
      ) : null}

      {sorted.length === 0 ? (
        <p className="py-4 text-sm text-[#1a1612]/40">Henüz proje yok.</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((p) => (
            <li
              key={p.id}
              draggable
              onDragStart={(e) => handleDragStart(e, p.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, p.id)}
              className={`group flex items-center gap-3 rounded-xl border border-[#e8e0d4] bg-white/60 px-4 py-3 transition-all hover:border-[#d4c9bb] ${
                draggedId === p.id ? "opacity-60" : ""
              }`}
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-[#a09588]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#1a1612]">{p.org_name}</p>
                <p className="mt-0.5 truncate text-xs text-[#a09588]">{p.role_title || p.years || "—"}</p>
              </div>
              <div
                className={`flex shrink-0 items-center gap-1 transition-opacity ${
                  confirmDeleteId === p.id
                    ? "opacity-100"
                    : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                }`}
              >
                <Link
                  href={`/secretgate/translations/volunteer/${p.id}/edit`}
                  className="rounded-lg p-1.5 text-[#6b6158] transition-colors hover:bg-[#1a1612]/8 hover:text-[#1a1612]"
                  aria-label="Düzenle"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                {confirmDeleteId === p.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-red-500">Emin misin?</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
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
                    onClick={() => setConfirmDeleteId(p.id)}
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
