"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  adminCreateSocialLink,
  adminUpdateSocialLink,
  adminDeleteSocialLink,
  adminReorderSocialLinks,
} from "@/app/admin/actions";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { getLucideIcon, LUCIDE_ICON_NAMES } from "@/lib/lucide-icons";

const PLATFORMS = [
  "instagram",
  "youtube",
  "linkedin",
  "x",
  "spotify",
  "mail",
  "link",
];

interface SocialLinkRow {
  id: string;
  platform: string;
  url: string;
  icon_name: string | null;
  is_active: boolean;
  order_index: number;
}

export function AdminSocialsForm({ links }: { links: SocialLinkRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [orderedLinks, setOrderedLinks] = useState(links);
  useEffect(() => setOrderedLinks(links), [links]);

  const syncOrder = (newOrder: SocialLinkRow[]) => {
    setOrderedLinks(newOrder);
    adminReorderSocialLinks(newOrder.map((l) => l.id)).then(() => router.refresh());
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== id) setDragOverId(id);
  };

  const handleDragLeave = () => setDragOverId(null);

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDraggedId(null);
    setDragOverId(null);
    const fromId = e.dataTransfer.getData("text/plain");
    if (!fromId || fromId === targetId) return;
    const fromIdx = orderedLinks.findIndex((l) => l.id === fromId);
    const toIdx = orderedLinks.findIndex((l) => l.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const next = [...orderedLinks];
    const [removed] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, removed);
    syncOrder(next);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await adminCreateSocialLink(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    (e.target as HTMLFormElement).reset();
  }

  async function handleUpdate(id: string, formData: FormData) {
    setLoading(true);
    const result = await adminUpdateSocialLink(id, formData);
    setLoading(false);
    if (result?.error) setError(result.error);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu linki silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    await adminDeleteSocialLink(id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-6">
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6"
      >
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <Plus className="h-4 w-4" />
          Yeni link ekle
        </h2>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">
              Platform
            </label>
            <select
              name="platform"
              className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">
              İkon (Lucide)
            </label>
            <select
              name="icon_name"
              className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              {LUCIDE_ICON_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-[var(--muted)]">
              URL *
            </label>
            <input
              name="url"
              type="url"
              required
              className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
              placeholder="https://... veya mail için: mailto:email@..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">
              Sıra
            </label>
            <input
              name="order_index"
              type="number"
              defaultValue={links.length}
              className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-[var(--input)]"
            />
            <label className="text-sm">Aktif</label>
          </div>
          <div className="flex items-end sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              Ekle
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="font-medium">Mevcut linkler (sürükle-bırak ile sırala)</h2>
        {orderedLinks.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Henüz link yok</p>
        ) : (
          <div className="space-y-2">
            {orderedLinks.map((link) => {
              const Icon = getLucideIcon(link.icon_name ?? link.platform);
              return (
                <div
                  key={link.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, link.id)}
                  onDragOver={(e) => handleDragOver(e, link.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, link.id)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-2 rounded-lg border bg-[var(--card)]/30 p-3 transition ${
                    draggedId === link.id ? "opacity-50" : ""
                  } ${dragOverId === link.id ? "border-[var(--accent)] bg-[var(--accent-soft)]/30" : "border-[var(--card-border)]"}`}
                >
                  <div className="cursor-grab text-[var(--muted)] active:cursor-grabbing">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <Icon className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdate(link.id, new FormData(e.currentTarget));
                    }}
                    className="flex flex-1 flex-wrap items-center gap-2"
                  >
                    <select
                      name="platform"
                      defaultValue={link.platform}
                      className="w-28 rounded border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-sm"
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <select
                      name="icon_name"
                      defaultValue={link.icon_name ?? link.platform}
                      className="w-24 rounded border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-sm"
                    >
                      {LUCIDE_ICON_NAMES.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <input
                      name="url"
                      type="url"
                      defaultValue={link.url}
                      required
                      className="min-w-[180px] flex-1 rounded border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-sm"
                    />
                    <input
                      name="order_index"
                      type="hidden"
                      value={orderedLinks.findIndex((l) => l.id === link.id)}
                    />
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        name="is_active"
                        type="checkbox"
                        defaultChecked={link.is_active}
                        className="h-3 w-3"
                      />
                      Aktif
                    </label>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded px-2 py-1 text-xs text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                    >
                      Kaydet
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={() => handleDelete(link.id)}
                    disabled={loading}
                    className="rounded p-1 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
