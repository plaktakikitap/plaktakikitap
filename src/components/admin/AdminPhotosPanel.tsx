"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { AdminImageUpload } from "./AdminImageUpload";
import type { Photo } from "@/types/photos";

export function AdminPhotosPanel({ initialPhotos }: { initialPhotos: Photo[] }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadPath, setUploadPath] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    image_url: "",
    caption: "",
    shot_at: "",
    type: "" as "" | "analog" | "digital" | "other",
    tags: "",
    camera: "",
    year: "",
  });

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  async function fetchPhotos() {
    const res = await fetch("/api/admin/photos");
    if (res.ok) {
      const data = await res.json();
      setPhotos(data);
    }
    router.refresh();
  }

  const handleFileUpload = useCallback(
    async (file: File, path?: string, caption?: string) => {
      if (!file?.size) {
        setError("Dosya seçin.");
        return;
      }
      setError(null);
      setLoading(true);
      setUploadProgress(0);

      try {
        const uploadFd = new FormData();
        uploadFd.set("file", file);
        if (path?.trim()) uploadFd.set("path", path.trim());

        // Use XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest();
        const promise = new Promise<{ path: string }>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(percent);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
              } catch {
                reject(new Error("Invalid response"));
              }
            } else {
              try {
                const error = JSON.parse(xhr.responseText);
                reject(new Error(error.error || "Upload failed"));
              } catch {
                reject(new Error(`Upload failed: ${xhr.statusText}`));
              }
            }
          });

          xhr.addEventListener("error", () => reject(new Error("Network error")));
          xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

          xhr.open("POST", "/api/admin/photos/upload");
          xhr.send(uploadFd);
        });

        const data = await promise;
        setUploadPath(data.path);
        setForm((f) => ({ ...f, image_url: data.path, caption: caption || f.caption }));
        setUploadProgress(null);
        await fetchPhotos();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Yükleme başarısız.");
        setUploadProgress(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file") as File | null;
    const path = fd.get("path") as string;
    const caption = (fd.get("caption") as string)?.trim() ?? "";
    if (file) {
      await handleFileUpload(file, path?.trim() || undefined, caption);
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length > 0) {
        await handleFileUpload(files[0]);
      }
    },
    [handleFileUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const image_url = form.image_url.trim();
    if (!image_url) {
      setError("Görsel URL veya yükleme path gerekli.");
      return;
    }
    const caption = form.caption.trim() || null;
    const shot_at = form.shot_at.trim() || null;
    const type = form.type && ["analog", "digital", "other"].includes(form.type) ? form.type : null;
    const tags = form.tags
      .split(/[\s,]+/)
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);
    const camera = form.camera.trim() || null;
    const year = form.year.trim() ? parseInt(form.year, 10) : null;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url,
          caption,
          shot_at,
          type,
          tags,
          camera,
          year: year ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ekleme başarısız.");
        return;
      }
      setForm({ image_url: "", caption: "", shot_at: "", type: "", tags: "", camera: "", year: "" });
      setUploadPath("");
      await fetchPhotos();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu fotoğrafı silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/photos/${id}`, { method: "DELETE" });
      if (res.ok) await fetchPhotos();
      else setError("Silme başarısız.");
    } finally {
      setLoading(false);
    }
  }

  const cameraOptions = Array.from(
    new Set(photos.map((p) => p.camera).filter(Boolean)) as Set<string>
  ).sort();

  return (
    <div className="mt-6 space-y-8">
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <Upload className="h-4 w-4" />
          Görsel yükle (photos-media)
        </h2>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleUpload} className="space-y-4">
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed transition-all duration-200 backdrop-blur-sm ${
              isDragging
                ? "border-[var(--primary)] bg-[var(--primary)]/10"
                : "border-[var(--card-border)] bg-[var(--card)]/20"
            }`}
          >
            <input
              ref={fileInputRef}
              name="file"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full cursor-pointer opacity-0"
            />
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <ImageIcon className="mb-3 h-10 w-10 text-[var(--muted)]" />
              <p className="mb-1 text-sm font-medium text-[var(--foreground)]">
                {isDragging ? "Dosyayı buraya bırakın" : "Dosyayı sürükleyin veya tıklayın"}
              </p>
              <p className="text-xs text-[var(--muted)]">
                PNG, JPG, WEBP, GIF (max 10MB)
              </p>
            </div>
            {uploadProgress !== null && (
              <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--muted)]/20">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-center text-xs text-[var(--muted)]">
                  {uploadProgress}%
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-sm text-[var(--muted)]">Path (opsiyonel)</label>
              <input
                name="path"
                type="text"
                placeholder="2024/ocak-01.jpg"
                className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-xs text-[var(--muted)]">Açıklama (opsiyonel)</label>
              <input
                name="caption"
                type="text"
                placeholder="Kısa açıklama..."
                className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted)]/70"
              />
            </div>
          </div>
        </form>
        {uploadPath && (
          <p className="mt-2 text-xs text-[var(--muted)]">
            Path: <code className="rounded bg-black/10 px-1">{uploadPath}</code> (aşağıdaki forma kopyalandı)
          </p>
        )}
      </section>

      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <Plus className="h-4 w-4" />
          Yeni fotoğraf ekle
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">Görsel *</label>
            <AdminImageUpload
              name="image_url"
              value={form.image_url}
              onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
              placeholder="Fotoğraf yükle"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">Açıklama (opsiyonel)</label>
            <input
              value={form.caption}
              onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
              type="text"
              placeholder="Kısa açıklama..."
              className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted)]/70"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-[var(--muted)]">Çekim tarihi (shot_at)</label>
              <input
                value={form.shot_at}
                onChange={(e) => setForm((f) => ({ ...f, shot_at: e.target.value }))}
                type="date"
                className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--muted)]">Tip (filtre)</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof form.type }))}
                className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="">Seçin</option>
                <option value="analog">Analog</option>
                <option value="digital">Dijital</option>
                <option value="other">Diğer</option>
              </select>
            </div>
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer text-[var(--muted)]">Etiketler, kamera, yıl (opsiyonel)</summary>
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-xs text-[var(--muted)]">Etiketler (virgül veya boşluk)</label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  type="text"
                  placeholder="street, istanbul"
                  className="w-full rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="mb-1 block text-xs text-[var(--muted)]">Kamera</label>
                  <input
                    list="cameras"
                    value={form.camera}
                    onChange={(e) => setForm((f) => ({ ...f, camera: e.target.value }))}
                    type="text"
                    placeholder="Minolta, Canon..."
                    className="w-48 rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                  <datalist id="cameras">
                    {cameraOptions.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[var(--muted)]">Yıl</label>
                  <input
                    value={form.year}
                    onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                    type="number"
                    min="1900"
                    max="2100"
                    placeholder="2024"
                    className="w-24 rounded border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </details>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50"
          >
            Ekle
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 font-medium">Fotoğraflar ({photos.length}) — en yeniler üstte</h2>
        {photos.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Henüz fotoğraf yok.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {photos.map((p) => (
              <div
                key={p.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--card-border)] bg-[var(--card)]/30"
              >
                {p.image_url.startsWith("http") ? (
                  <img
                    src={p.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-[var(--muted)]/20 text-xs text-[var(--muted)]">
                    path
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="min-w-0 flex-1 truncate text-xs text-white/90">
                    {(p.caption || p.type || p.shot_at) && (
                      <span>
                        {[p.type, p.shot_at, p.caption].filter(Boolean).join(" · ")}
                      </span>
                    )}
                    {!p.caption && !p.type && !p.shot_at && (
                      <span className="font-mono">{p.image_url}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    disabled={loading}
                    className="shrink-0 rounded p-1.5 text-white/80 hover:bg-red-500/30 hover:text-white disabled:opacity-50"
                    aria-label="Sil"
                  >
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
