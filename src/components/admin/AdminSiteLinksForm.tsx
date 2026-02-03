"use client";

import { useRouter } from "next/navigation";
import {
  adminCreateSiteLink,
  adminUpdateSiteLink,
  adminDeleteSiteLink,
} from "@/app/admin/actions";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface SiteLinkRow {
  id: string;
  type: string;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
}

export function AdminSiteLinksForm({ links }: { links: SiteLinkRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await adminCreateSiteLink(formData);
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
    const result = await adminUpdateSiteLink(id, formData);
    setLoading(false);
    if (result?.error) setError(result.error);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu linki silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    await adminDeleteSiteLink(id);
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
            <label className="mb-1 block text-sm text-[var(--muted)]">Tip</label>
            <select
              name="type"
              className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <option value="mail">Mail</option>
              <option value="instagram">Instagram</option>
              <option value="x">X (Twitter)</option>
              <option value="linkedin">LinkedIn</option>
              <option value="youtube">YouTube</option>
              <option value="spotify">Spotify</option>
              <option value="link">Link</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">
              Etiket *
            </label>
            <input
              name="label"
              type="text"
              required
              className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
              placeholder="Instagram"
            />
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
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">
              Sıra
            </label>
            <input
              name="sort_order"
              type="number"
              defaultValue={0}
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
        <h2 className="font-medium">Mevcut linkler</h2>
        {links.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Henüz link yok</p>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <form
                key={link.id}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate(link.id, new FormData(e.currentTarget));
                }}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)]/30 p-3"
              >
                <input
                  name="type"
                  defaultValue={link.type}
                  className="w-24 rounded border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-sm"
                />
                <input
                  name="label"
                  defaultValue={link.label}
                  required
                  className="min-w-[100px] rounded border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-sm"
                />
                <input
                  name="url"
                  type="url"
                  defaultValue={link.url}
                  required
                  className="min-w-[180px] flex-1 rounded border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-sm"
                />
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={link.sort_order}
                  className="w-14 rounded border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-sm"
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
                <button
                  type="button"
                  onClick={() => handleDelete(link.id)}
                  disabled={loading}
                  className="rounded p-1 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
