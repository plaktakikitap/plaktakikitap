"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  adminCreateArt,
  adminUpdateArt,
  adminDeleteArt,
  adminAddArtMedia,
  adminDeleteArtMedia,
} from "@/app/admin/actions";
import type { ArtItem } from "@/lib/db/queries";
import { getVideoEmbedUrl } from "@/lib/utils/embed";
import { Palette, Plus, Pencil, Trash2, Image, Video, Link2, X } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm";
const labelClass = "block text-xs font-medium text-[var(--muted)] mt-3 first:mt-0";

export function AdminArt({ items }: { items: ArtItem[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingMediaTo, setAddingMediaTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(formData: FormData) {
    setError(null);
    const r = await adminCreateArt(formData);
    if (r.error) setError(r.error);
    else {
      setShowCreate(false);
      router.refresh();
    }
  }

  async function handleUpdate(id: string, formData: FormData) {
    setError(null);
    const r = await adminUpdateArt(id, formData);
    if (r.error) setError(r.error);
    else {
      setEditingId(null);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this art item?")) return;
    await adminDeleteArt(id);
    router.refresh();
  }

  async function handleAddMedia(formData: FormData) {
    setError(null);
    const r = await adminAddArtMedia(formData);
    if (r.error) setError(r.error);
    else {
      setAddingMediaTo(null);
      router.refresh();
    }
  }

  async function handleDeleteMedia(id: string) {
    await adminDeleteArtMedia(id);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Art</h1>
          <p className="mt-1 text-[var(--muted)]">
            Create art items. Use visibility &quot;unlisted&quot; for direct-link-only sharing.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Art
        </button>
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {showCreate && (
        <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <h2 className="text-lg font-semibold">Create Art</h2>
          <form action={handleCreate} className="mt-3 space-y-2">
            <label className={labelClass}>Title *</label>
            <input name="title" required className={inputClass} />
            <label className={labelClass}>Slug (optional, for URL)</label>
            <input name="slug" className={inputClass} placeholder="my-art-piece" />
            <label className={labelClass}>Description</label>
            <textarea name="description" rows={3} className={inputClass} />
            <label className={labelClass}>Visibility</label>
            <select
              name="visibility"
              className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
            >
              <option value="public">Public (in gallery)</option>
              <option value="unlisted">Unlisted (direct link only)</option>
              <option value="private">Private</option>
            </select>
            <div className="mt-3 flex gap-2">
              <button type="submit" className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white">
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Items</h2>
        {items.length === 0 ? (
          <p className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] py-12 text-center text-[var(--muted)]">
            No art items yet.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]"
              >
                {editingId === item.id ? (
                  <form action={(fd) => handleUpdate(item.id, fd)} className="p-4">
                    <label className={labelClass}>Title *</label>
                    <input name="title" required className={inputClass} defaultValue={item.title} />
                    <label className={labelClass}>Slug</label>
                    <input name="slug" className={inputClass} defaultValue={item.slug ?? ""} />
                    <label className={labelClass}>Description</label>
                    <textarea name="description" rows={3} className={inputClass} defaultValue={item.description ?? ""} />
                    <label className={labelClass}>Visibility</label>
                    <select
                      name="visibility"
                      className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                      defaultValue={item.visibility}
                    >
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted</option>
                      <option value="private">Private</option>
                    </select>
                    <div className="mt-3 flex gap-2">
                      <button type="submit" className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white">
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border px-4 py-2 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start gap-4 p-4">
                      <div className="flex h-16 w-12 shrink-0 overflow-hidden rounded bg-[var(--card-border)]">
                        {item.media[0]?.kind === "image" ? (
                          <img src={item.media[0].url} alt="" className="h-full w-full object-cover" />
                        ) : item.media[0] && getVideoEmbedUrl(item.media[0].url) ? (
                          <div className="flex h-full w-full items-center justify-center bg-black">
                            <Video className="h-6 w-6 text-white/70" />
                          </div>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Palette className="h-6 w-6 text-[var(--muted)]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.title}</span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] ${
                              item.visibility === "public"
                                ? "bg-green-500/20 text-green-700"
                                : item.visibility === "unlisted"
                                  ? "bg-amber-500/20 text-amber-700"
                                  : "bg-[var(--card-border)] text-[var(--muted)]"
                            }`}
                          >
                            {item.visibility}
                          </span>
                        </div>
                        <Link
                          href={item.slug ? `/art/${item.slug}` : `/art/${item.id}`}
                          target="_blank"
                          className="mt-0.5 text-xs text-[var(--accent)] hover:underline"
                        >
                          View on site →
                        </Link>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingId(item.id)}
                          className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded p-1.5 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {item.media.length > 0 && (
                      <div className="border-t border-[var(--card-border)] px-4 py-2">
                        <div className="flex flex-wrap gap-2">
                          {item.media.map((m) => (
                            <div
                              key={m.id}
                              className="flex items-center gap-1 rounded border border-[var(--card-border)] bg-[var(--background)] px-2 py-1 text-xs"
                            >
                              {m.kind === "image" && <Image className="h-3 w-3" />}
                              {m.kind === "video" && <Video className="h-3 w-3" />}
                              {m.kind === "link" && <Link2 className="h-3 w-3" />}
                              <span className="max-w-[120px] truncate">{m.url}</span>
                              <button
                                onClick={() => handleDeleteMedia(m.id)}
                                className="text-[var(--muted)] hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {addingMediaTo === item.id ? (
                      <form action={handleAddMedia} className="border-t border-[var(--card-border)] p-4">
                        <input type="hidden" name="content_id" value={item.id} />
                        <label className={labelClass}>Kind</label>
                        <select
                          name="kind"
                          className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                          <option value="link">Link (YouTube, Vimeo)</option>
                        </select>
                        <label className={labelClass}>URL *</label>
                        <input name="url" type="url" required className={inputClass} />
                        <label className={labelClass}>Caption</label>
                        <input name="caption" className={inputClass} />
                        <div className="mt-2 flex gap-2">
                          <button type="submit" className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm text-white">
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingMediaTo(null)}
                            className="rounded-lg border px-3 py-1.5 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="border-t border-[var(--card-border)] px-4 py-2">
                        <button
                          onClick={() => setAddingMediaTo(item.id)}
                          className="text-xs text-[var(--accent)] hover:underline"
                        >
                          + Add media
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
