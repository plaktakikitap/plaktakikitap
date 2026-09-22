"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import type { Photo, PhotoCategory } from "@/types/photos";
import { PHOTO_CATEGORIES, resolvePhotoCategory } from "@/types/photos";
import { QuickPhotoForm } from "./QuickPhotoForm";
import { showAdminToast } from "./admin-toast-events";
import {
  AdminFieldLabel,
  AdminSaveBar,
  AdminTextInput,
  fieldClass,
  labelClass,
} from "./AdminFormPrimitives";

export function AdminPhotosPanel({ initialPhotos }: { initialPhotos: Photo[] }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Photo | null>(null);
  const [caption, setCaption] = useState("");
  const [camera, setCamera] = useState("");
  const [lens, setLens] = useState("");
  const [film, setFilm] = useState("");
  const [category, setCategory] = useState<PhotoCategory>("dijital");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  function startEdit(photo: Photo) {
    setEditing(photo);
    setCaption(photo.caption ?? "");
    setCamera(photo.camera ?? "");
    setLens(photo.lens ?? "");
    setFilm(photo.film ?? "");
    setCategory(resolvePhotoCategory(photo));
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu fotoğrafı silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/photos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPhotos((p) => p.filter((x) => x.id !== id));
        if (editing?.id === id) setEditing(null);
        showAdminToast("success", "Silindi ✓");
        router.refresh();
      } else {
        showAdminToast("error", "Silme başarısız.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/photos/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: caption.trim() || null,
          camera: camera.trim() || null,
          lens: lens.trim() || null,
          film: film.trim() || null,
          category,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showAdminToast("error", data.error || "Güncelleme başarısız.");
        return;
      }
      setPhotos((list) =>
        list.map((p) => (p.id === editing.id ? { ...p, ...data } : p))
      );
      setEditing(null);
      showAdminToast("success", "Güncellendi ✓");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <QuickPhotoForm recent={photos} />

      {editing ? (
        <form
          onSubmit={handleSaveEdit}
          className="rounded-2xl border border-amber-400/20 bg-white/[0.03] p-5 sm:p-6"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium text-white/80">Fotoğrafı düzenle</h2>
              <p className="mt-0.5 text-[11px] text-white/40">
                Camera, lens, film ve kategori
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {editing.image_url.startsWith("http") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={editing.image_url}
              alt=""
              className="mb-4 max-h-36 rounded-lg object-contain"
            />
          ) : null}

          <div className="space-y-4">
            <div>
              <AdminFieldLabel htmlFor="edit-photo-caption">Açıklama</AdminFieldLabel>
              <AdminTextInput
                id="edit-photo-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <AdminFieldLabel htmlFor="edit-photo-camera">Camera</AdminFieldLabel>
                <AdminTextInput
                  id="edit-photo-camera"
                  value={camera}
                  onChange={(e) => setCamera(e.target.value)}
                  placeholder="Canon AE-1"
                />
              </div>
              <div>
                <AdminFieldLabel htmlFor="edit-photo-lens">Lens</AdminFieldLabel>
                <AdminTextInput
                  id="edit-photo-lens"
                  value={lens}
                  onChange={(e) => setLens(e.target.value)}
                  placeholder="50mm"
                />
              </div>
              <div>
                <AdminFieldLabel htmlFor="edit-photo-film">Film</AdminFieldLabel>
                <AdminTextInput
                  id="edit-photo-film"
                  value={film}
                  onChange={(e) => setFilm(e.target.value)}
                  placeholder="Kodak Gold 200"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="edit-photo-category">
                  Category
                </label>
                <select
                  id="edit-photo-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PhotoCategory)}
                  className={fieldClass}
                >
                  {PHOTO_CATEGORIES.map((opt) => (
                    <option key={opt} value={opt} className="bg-zinc-900 text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <AdminSaveBar loading={saving} label="Kaydet" />
          </div>
        </form>
      ) : null}

      <section>
        <h2 className="mb-4 text-sm font-medium text-white/70">
          Fotoğraflar ({photos.length})
        </h2>
        {photos.length === 0 ? (
          <p className="text-sm text-white/45">Henüz fotoğraf yok.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {photos.map((p) => (
              <div
                key={p.id}
                className={`group relative aspect-square overflow-hidden rounded-lg border bg-white/5 ${
                  editing?.id === p.id
                    ? "border-amber-400/50"
                    : "border-white/10"
                }`}
              >
                {p.image_url.startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs text-white/40">
                    path
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="min-w-0 flex-1 truncate text-xs text-white/90">
                    {p.caption || resolvePhotoCategory(p)}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="rounded p-1.5 text-white/80 hover:bg-white/20 hover:text-white"
                      aria-label="Düzenle"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      disabled={loading}
                      className="rounded p-1.5 text-white/80 hover:bg-red-500/30 hover:text-white disabled:opacity-50"
                      aria-label="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
