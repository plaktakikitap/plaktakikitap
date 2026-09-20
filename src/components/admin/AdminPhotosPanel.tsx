"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { Photo } from "@/types/photos";
import { QuickPhotoForm } from "./QuickPhotoForm";
import { showAdminToast } from "./admin-toast-events";

export function AdminPhotosPanel({ initialPhotos }: { initialPhotos: Photo[] }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  async function handleDelete(id: string) {
    if (!confirm("Bu fotoğrafı silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/photos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPhotos((p) => p.filter((x) => x.id !== id));
        showAdminToast("success", "Silindi ✓");
        router.refresh();
      } else {
        showAdminToast("error", "Silme başarısız.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <QuickPhotoForm recent={photos} />

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
                className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/5"
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
                    {p.caption || "—"}
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
