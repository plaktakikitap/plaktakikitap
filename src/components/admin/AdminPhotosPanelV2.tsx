"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Image as ImageIcon, Search, X, Pencil, Trash2 } from "lucide-react";
import { showAdminToast } from "./admin-toast-events";
import {
  AdminFieldLabel,
  AdminSaveBar,
  AdminTextInput,
  fieldClass,
  labelClass,
} from "./AdminFormPrimitives";
import type { Photo, PhotoCategory } from "@/types/photos";
import { PHOTO_CATEGORIES, resolvePhotoCategory } from "@/types/photos";

type MainTab = "liste" | "yukle";
type FilterTab = "hepsi" | "analog" | "dijital" | "diğer";

function PhotoUploadForm({ onUploaded }: { onUploaded: (p: Photo) => void }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [camera, setCamera] = useState("");
  const [lens, setLens] = useState("");
  const [film, setFilm] = useState("");
  const [category, setCategory] = useState<PhotoCategory>("dijital");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pickFile = useCallback((f: File | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const next = f ? URL.createObjectURL(f) : null;
    previewUrlRef.current = next;
    setPreview(next);
    setFile(f);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  async function uploadFile(f: File): Promise<string> {
    const uploadFd = new FormData();
    uploadFd.set("file", f);
    const xhr = new XMLHttpRequest();
    const promise = new Promise<{ path: string }>((resolve, reject) => {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error("Geçersiz yanıt"));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || "Yükleme başarısız"));
          } catch {
            reject(new Error("Yükleme başarısız"));
          }
        }
      });
      xhr.addEventListener("error", () => reject(new Error("Ağ hatası")));
      xhr.open("POST", "/api/admin/photos/upload");
      xhr.send(uploadFd);
    });
    const data = await promise;
    return data.path;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      showAdminToast("error", "Fotoğraf seçin.");
      return;
    }
    setLoading(true);
    setUploadProgress(0);
    try {
      const image_url = await uploadFile(file);
      const res = await fetch("/api/admin/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url,
          caption: caption.trim() || null,
          camera: camera.trim() || null,
          lens: lens.trim() || null,
          film: film.trim() || null,
          category,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showAdminToast("error", (data as { error?: string }).error || "Fotoğraf eklenemedi.");
        return;
      }
      showAdminToast("success", "Fotoğraf yüklendi ✓");
      onUploaded(data as Photo);
      pickFile(null);
      setCaption("");
      setCamera("");
      setLens("");
      setFilm("");
      setCategory("dijital");
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (err) {
      showAdminToast(
        "error",
        err instanceof Error ? err.message : "Yükleme başarısız."
      );
    } finally {
      setUploadProgress(null);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const f = Array.from(e.dataTransfer.files).find((x) =>
            x.type.startsWith("image/")
          );
          if (f) pickFile(f);
        }}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition ${
          isDragging
            ? "border-[#b8934a]/60 bg-[#b8934a]/8"
            : "border-[#d4c9bb] bg-[#1a1612]/3"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            pickFile(f);
          }}
        />
        {preview ? (
          <div className="flex flex-col items-center gap-3 px-4 py-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt=""
              className="max-h-48 rounded-xl object-contain shadow-sm"
            />
            <p className="text-xs text-[#6b6158]">Değiştirmek için tıkla</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b8934a]/10">
              <ImageIcon className="h-6 w-6 text-[#b8934a]" />
            </div>
            <p className="text-sm font-medium text-[#1a1612]">
              {isDragging ? "Bırak" : "Sürükle veya tıkla"}
            </p>
            <p className="mt-1 text-xs text-[#a09588]">JPG, PNG, WEBP · max 10MB</p>
          </div>
        )}
        {uploadProgress !== null && (
          <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-[#1a1612]/8">
              <div
                className="h-full rounded-full bg-[#b8934a] transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="mt-1 text-center text-xs text-[#6b6158]">
              {uploadProgress}%
            </p>
          </div>
        )}
      </div>

      <div>
        <AdminFieldLabel htmlFor="photo-caption">Açıklama</AdminFieldLabel>
        <AdminTextInput
          id="photo-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Opsiyonel"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <AdminFieldLabel htmlFor="photo-camera">Kamera</AdminFieldLabel>
          <AdminTextInput
            id="photo-camera"
            value={camera}
            onChange={(e) => setCamera(e.target.value)}
            placeholder="Canon AE-1"
          />
        </div>
        <div>
          <AdminFieldLabel htmlFor="photo-lens">Lens</AdminFieldLabel>
          <AdminTextInput
            id="photo-lens"
            value={lens}
            onChange={(e) => setLens(e.target.value)}
            placeholder="50mm f/1.8"
          />
        </div>
        <div>
          <AdminFieldLabel htmlFor="photo-film">Film</AdminFieldLabel>
          <AdminTextInput
            id="photo-film"
            value={film}
            onChange={(e) => setFilm(e.target.value)}
            placeholder="Kodak Gold 200"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="photo-category">
            Kategori
          </label>
          <select
            id="photo-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as PhotoCategory)}
            className={fieldClass}
          >
            {PHOTO_CATEGORIES.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
      <AdminSaveBar loading={loading} label="Yükle" />
    </form>
  );
}

function PhotoEditForm({
  photo,
  onSave,
  onCancel,
}: {
  photo: Photo;
  onSave: (updated: Photo) => void;
  onCancel: () => void;
}) {
  const [caption, setCaption] = useState(photo.caption ?? "");
  const [camera, setCamera] = useState(photo.camera ?? "");
  const [lens, setLens] = useState(photo.lens ?? "");
  const [film, setFilm] = useState(photo.film ?? "");
  const [category, setCategory] = useState<PhotoCategory>(
    resolvePhotoCategory(photo)
  );
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/photos/${photo.id}`, {
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
        showAdminToast(
          "error",
          (data as { error?: string }).error || "Güncelleme başarısız."
        );
        return;
      }
      onSave({
        ...photo,
        ...(typeof data === "object" && data ? data : {}),
        caption: caption.trim() || null,
        camera: camera.trim() || null,
        lens: lens.trim() || null,
        film: film.trim() || null,
        category,
      } as Photo);
      showAdminToast("success", "Güncellendi ✓");
    } catch {
      showAdminToast("error", "Güncelleme başarısız.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="space-y-3 rounded-2xl border border-[#b8934a]/20 bg-[#b8934a]/5 p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[#6b6158]">Fotoğrafı düzenle</p>
        <button
          type="button"
          onClick={onCancel}
          className="rounded p-1 text-[#6b6158] hover:text-[#1a1612]"
          aria-label="Kapat"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {photo.image_url.startsWith("http") && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.image_url}
          alt=""
          className="max-h-32 rounded-xl object-contain"
        />
      )}
      <div>
        <AdminFieldLabel htmlFor={`edit-caption-${photo.id}`}>
          Açıklama
        </AdminFieldLabel>
        <AdminTextInput
          id={`edit-caption-${photo.id}`}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <AdminFieldLabel htmlFor={`edit-camera-${photo.id}`}>
            Kamera
          </AdminFieldLabel>
          <AdminTextInput
            id={`edit-camera-${photo.id}`}
            value={camera}
            onChange={(e) => setCamera(e.target.value)}
            placeholder="Canon AE-1"
          />
        </div>
        <div>
          <AdminFieldLabel htmlFor={`edit-lens-${photo.id}`}>
            Lens
          </AdminFieldLabel>
          <AdminTextInput
            id={`edit-lens-${photo.id}`}
            value={lens}
            onChange={(e) => setLens(e.target.value)}
            placeholder="50mm"
          />
        </div>
        <div>
          <AdminFieldLabel htmlFor={`edit-film-${photo.id}`}>
            Film
          </AdminFieldLabel>
          <AdminTextInput
            id={`edit-film-${photo.id}`}
            value={film}
            onChange={(e) => setFilm(e.target.value)}
            placeholder="Kodak Gold 200"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`edit-cat-${photo.id}`}>
            Kategori
          </label>
          <select
            id={`edit-cat-${photo.id}`}
            value={category}
            onChange={(e) => setCategory(e.target.value as PhotoCategory)}
            className={fieldClass}
          >
            {PHOTO_CATEGORIES.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
      <AdminSaveBar loading={saving} label="Kaydet" />
    </form>
  );
}

export function AdminPhotosPanelV2({
  initialPhotos,
}: {
  initialPhotos: Photo[];
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [mainTab, setMainTab] = useState<MainTab>("liste");
  const [filterTab, setFilterTab] = useState<FilterTab>("hepsi");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  const counts: Record<FilterTab, number> = {
    hepsi: photos.length,
    analog: photos.filter((p) => resolvePhotoCategory(p) === "analog").length,
    dijital: photos.filter((p) => resolvePhotoCategory(p) === "dijital").length,
    diğer: photos.filter((p) => resolvePhotoCategory(p) === "diğer").length,
  };

  const filtered = photos.filter((p) => {
    if (filterTab !== "hepsi" && resolvePhotoCategory(p) !== filterTab) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (p.caption ?? "").toLowerCase().includes(q) ||
        (p.camera ?? "").toLowerCase().includes(q) ||
        (p.film ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/photos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPhotos((p) => p.filter((x) => x.id !== id));
        if (editingId === id) setEditingId(null);
        showAdminToast("success", "Silindi ✓");
        router.refresh();
      } else {
        showAdminToast("error", "Silme başarısız.");
      }
    } catch {
      showAdminToast("error", "Silme başarısız.");
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  }

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "hepsi", label: "Hepsi" },
    { key: "analog", label: "Analog" },
    { key: "dijital", label: "Dijital" },
    { key: "diğer", label: "Diğer" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <Camera className="h-6 w-6 text-[#b8934a]" />
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1612]">Fotoğraflar</h1>
          <p className="text-sm text-[#6b6158]">
            Yükle, kamera / lens / film ve kategori ekle.
          </p>
        </div>
      </header>

      <div className="flex gap-1 rounded-2xl border border-[#e8e0d4] bg-[#f4f0ea] p-1">
        {(["liste", "yukle"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setMainTab(t)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
              mainTab === t
                ? "bg-white text-[#1a1612] shadow-sm"
                : "text-[#6b6158] hover:text-[#1a1612]"
            }`}
          >
            {t === "liste" ? `Liste (${photos.length})` : "Yükle"}
          </button>
        ))}
      </div>

      {mainTab === "yukle" && (
        <PhotoUploadForm
          onUploaded={(p) => {
            setPhotos((prev) => [p, ...prev]);
            setMainTab("liste");
          }}
        />
      )}

      {mainTab === "liste" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 text-sm">
              {filterTabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setFilterTab(t.key)}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    filterTab === t.key
                      ? "bg-[#1a1612] text-[#faf7f2]"
                      : "text-[#6b6158] hover:text-[#1a1612]"
                  }`}
                >
                  {t.label}
                  <span className="ml-1 text-xs opacity-60">{counts[t.key]}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#e8e0d4] bg-white px-3 py-2">
              <Search className="h-3.5 w-3.5 text-[#a09588]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Açıklama, kamera, film…"
                className="flex-1 text-sm outline-none placeholder:text-[#a09588]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-[#a09588] hover:text-[#1a1612]"
                  aria-label="Aramayı temizle"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#a09588]">
              {search ? "Sonuç bulunamadı." : "Henüz fotoğraf yok."}
            </p>
          ) : (
            <div className="columns-2 gap-2 sm:columns-3 sm:gap-3">
              {filtered.map((p) => (
                <div key={p.id} className="mb-2 break-inside-avoid sm:mb-3">
                  {editingId === p.id ? (
                    <PhotoEditForm
                      photo={p}
                      onSave={(updated) => {
                        setPhotos((list) =>
                          list.map((x) => (x.id === updated.id ? updated : x))
                        );
                        setEditingId(null);
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="group relative overflow-hidden rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5">
                      {p.image_url.startsWith("http") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt=""
                          className="w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-square items-center justify-center text-xs text-[#a09588]">
                          yol
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-[#faf7f2]">
                            {p.caption?.trim() || resolvePhotoCategory(p)}
                          </p>
                          {p.camera && (
                            <p className="mt-0.5 truncate text-[10px] text-[#faf7f2]/70">
                              {p.camera}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(p.id);
                              setConfirmDeleteId(null);
                            }}
                            className="rounded-lg p-1.5 text-[#faf7f2]/80 backdrop-blur-sm hover:bg-white/20 hover:text-[#faf7f2]"
                            aria-label="Düzenle"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {confirmDeleteId === p.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDelete(p.id)}
                                disabled={deleting}
                                className="rounded-lg bg-red-500/80 px-2 py-1.5 text-[10px] font-medium text-[#faf7f2] backdrop-blur-sm hover:bg-red-500 disabled:opacity-50"
                              >
                                Sil
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-lg p-1.5 text-[#faf7f2]/80 backdrop-blur-sm hover:bg-white/20"
                                aria-label="Vazgeç"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(p.id)}
                              className="rounded-lg p-1.5 text-[#faf7f2]/80 backdrop-blur-sm hover:bg-red-500/60 hover:text-[#faf7f2]"
                              aria-label="Sil"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="absolute left-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-[#faf7f2]/80 backdrop-blur-sm">
                          {resolvePhotoCategory(p)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
