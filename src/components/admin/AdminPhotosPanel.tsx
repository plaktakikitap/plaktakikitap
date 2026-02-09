"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import type { Photo } from "@/types/photos";

export function AdminPhotosPanel({ initialPhotos }: { initialPhotos: Photo[] }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleFileUploadThenCreate = useCallback(
    async (file: File, path?: string) => {
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
        const xhr = new XMLHttpRequest();
        const promise = new Promise<{ path: string }>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
          });
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch {
                reject(new Error("Invalid response"));
              }
            } else {
              try {
                const err = JSON.parse(xhr.responseText);
                reject(new Error(err.error || "Yükleme başarısız"));
              } catch {
                reject(new Error(`Yükleme başarısız: ${xhr.statusText}`));
              }
            }
          });
          xhr.addEventListener("error", () => reject(new Error("Ağ hatası")));
          xhr.open("POST", "/api/admin/photos/upload");
          xhr.send(uploadFd);
        });
        const data = await promise;
        setForm((f) => ({ ...f, image_url: data.path }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Yükleme başarısız.");
      } finally {
        setUploadProgress(null);
        setLoading(false);
      }
    },
    []
  );

  return (
    <div className="mt-6 space-y-8">
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-medium text-white">
          <Plus className="h-4 w-4" />
          Fotoğraf ekle
        </h2>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/80">Görsel *</label>
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
                if (files[0]) handleFileUploadThenCreate(files[0]);
              }}
              className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 ${
                isDragging ? "border-amber-400/60 bg-amber-500/10" : "border-white/20 bg-white/5"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full cursor-pointer opacity-0"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUploadThenCreate(file);
                  e.target.value = "";
                }}
              />
              {form.image_url ? (
                <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
                  <p className="text-sm font-medium text-white/90">Görsel seçildi. Aşağıyı doldurup Ekle diyebilirsiniz.</p>
                  <p className="mt-1 text-xs text-white/60">Yeniden seçmek için tıklayın veya sürükleyin</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                  <ImageIcon className="mb-3 h-10 w-10 text-white/50" />
                  <p className="mb-1 text-sm font-medium text-white/90">
                    {isDragging ? "Dosyayı buraya bırakın" : "Dosyayı sürükleyin veya tıklayın"}
                  </p>
                  <p className="text-xs text-white/50">PNG, JPG, WEBP, GIF (max 10MB)</p>
                </div>
              )}
              {uploadProgress !== null && (
                <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-center text-xs text-white/60">{uploadProgress}%</p>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-white/80">Açıklama (opsiyonel)</label>
              <input
                value={form.caption}
                onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
                type="text"
                placeholder="Kısa açıklama..."
                className="w-full rounded-lg border border-[var(--card-border)] bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/80">Çekim tarihi</label>
              <input
                value={form.shot_at}
                onChange={(e) => setForm((f) => ({ ...f, shot_at: e.target.value }))}
                type="date"
                className="w-full rounded-lg border border-[var(--card-border)] bg-white px-3 py-2 text-sm text-neutral-900"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/80">Tip</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof form.type }))}
              className="w-full rounded-lg border border-[var(--card-border)] bg-white px-3 py-2 text-sm text-neutral-900"
            >
              <option value="">Seçin</option>
              <option value="analog">Analog</option>
              <option value="digital">Dijital</option>
              <option value="other">Diğer</option>
            </select>
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer text-white/70">Etiketler, kamera, yıl (opsiyonel)</summary>
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-xs text-white/70">Etiketler (virgül veya boşluk)</label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  type="text"
                  placeholder="street, istanbul"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-white px-3 py-2 text-sm text-neutral-900"
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="mb-1 block text-xs text-white/70">Kamera</label>
                  <input
                    list="cameras"
                    value={form.camera}
                    onChange={(e) => setForm((f) => ({ ...f, camera: e.target.value }))}
                    type="text"
                    placeholder="Minolta, Canon..."
                    className="w-48 rounded-lg border border-[var(--card-border)] bg-white px-3 py-2 text-sm text-neutral-900"
                  />
                  <datalist id="cameras">
                    {cameraOptions.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">Yıl</label>
                  <input
                    value={form.year}
                    onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                    type="number"
                    min={1900}
                    max={2100}
                    placeholder="2024"
                    className="w-24 rounded-lg border border-[var(--card-border)] bg-white px-3 py-2 text-sm text-neutral-900"
                  />
                </div>
              </div>
            </div>
          </details>
          <button
            type="submit"
            disabled={loading || !form.image_url.trim()}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50"
          >
            Ekle
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 font-medium text-white">Fotoğraflar ({photos.length}) — en yeniler üstte</h2>
        {photos.length === 0 ? (
          <p className="text-sm text-white/60">Henüz fotoğraf yok.</p>
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
