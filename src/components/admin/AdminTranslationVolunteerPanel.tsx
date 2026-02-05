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
} from "@/app/admin/actions";

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm";
const labelClass = "mb-1 block text-sm font-medium text-[var(--muted)]";

function isValidUrl(s: string) {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

export function AdminTranslationVolunteerPanel({
  projects,
}: {
  projects: TranslationVolunteerProjectRow[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const sorted = [...projects].sort((a, b) => a.order_index - b.order_index);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const website_url = (form.querySelector('[name="website_url"]') as HTMLInputElement)?.value?.trim() || null;
    const instagram_url = (form.querySelector('[name="instagram_url"]') as HTMLInputElement)?.value?.trim() || null;
    const x_url = (form.querySelector('[name="x_url"]') as HTMLInputElement)?.value?.trim() || null;
    if (website_url && !isValidUrl(website_url)) {
      setError("Website URL geçerli değil.");
      return;
    }
    if (instagram_url && !isValidUrl(instagram_url)) {
      setError("Instagram URL geçerli değil.");
      return;
    }
    if (x_url && !isValidUrl(x_url)) {
      setError("X URL geçerli değil.");
      return;
    }
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
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu projeyi silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    const result = await adminDeleteTranslationVolunteer(id);
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

  async function handleReorder(newOrder: TranslationVolunteerProjectRow[]) {
    setLoading(true);
    setError(null);
    const result = await adminReorderTranslationVolunteer(newOrder.map((p) => p.id));
    setLoading(false);
    if (result?.error) setError(result.error);
    else router.refresh();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <Plus className="h-4 w-4" />
          Gönüllü proje ekle
        </h2>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Kurum adı (org_name) *</label>
            <input name="org_name" required className={inputClass} placeholder="Felsefelog" />
          </div>
          <div>
            <label className={labelClass}>Rol (role_title)</label>
            <input name="role_title" className={inputClass} placeholder="Gönüllü çevirmen" />
          </div>
          <div>
            <label className={labelClass}>Yıllar (years)</label>
            <input name="years" className={inputClass} placeholder="2022–2023" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Açıklama (description)</label>
            <textarea name="description" rows={3} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Highlight’lar (her satıra bir)</label>
            <textarea name="highlights" rows={4} className={inputClass} placeholder="Satır satır madde" />
          </div>
          <div>
            <label className={labelClass}>website_url</label>
            <input name="website_url" type="url" className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>instagram_url</label>
            <input name="instagram_url" type="url" className={inputClass} placeholder="https://..." />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>x_url</label>
            <input name="x_url" type="url" className={inputClass} placeholder="https://..." />
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
        <h2 className="mb-4 font-medium">Gönüllü projeler ({projects.length})</h2>
        {sorted.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Henüz proje yok.</p>
        ) : (
          <div className="space-y-3">
            {sorted.map((p) => (
              <div
                key={p.id}
                draggable
                onDragStart={(e) => handleDragStart(e, p.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, p.id)}
                className={`flex items-center gap-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)]/30 px-4 py-3 ${draggedId === p.id ? "opacity-60" : ""}`}
              >
                <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-[var(--muted)]" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{p.org_name}</p>
                  <p className="text-sm text-[var(--muted)]">{p.role_title || p.years || "—"}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/translations/volunteer/${p.id}/edit`} className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--background)]" aria-label="Düzenle">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button type="button" onClick={() => handleDelete(p.id)} disabled={loading} className="rounded p-1.5 text-red-600 hover:bg-red-500/10" aria-label="Sil">
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
