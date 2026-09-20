"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon } from "lucide-react";
import { showAdminToast } from "./admin-toast-events";
import {
  AdminFieldLabel,
  AdminRecentList,
  AdminSaveBar,
  AdminTextInput,
  useAdminCmdEnter,
} from "./AdminFormPrimitives";
import type { Photo } from "@/types/photos";

export function QuickPhotoForm({
  recent = [],
}: {
  recent?: Photo[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useAdminCmdEnter(formRef);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pickFile = useCallback((f: File | null) => {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return f ? URL.createObjectURL(f) : null;
    });
    setFile(f);
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
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showAdminToast("error", data.error || "Fotoğraf eklenemedi.");
        return;
      }
      showAdminToast("success", "Fotoğraf yüklendi ✓");
      pickFile(null);
      setCaption("");
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

  const recentItems = recent.slice(0, 5).map((p) => ({
    id: p.id,
    title: p.caption?.trim() || "Fotoğraf",
    meta: new Date(p.created_at).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    }),
  }));

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
    >
      <AdminRecentList items={recentItems} />

      <div className="space-y-4">
        <div>
          <AdminFieldLabel required>Fotoğraf</AdminFieldLabel>
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
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition ${
              isDragging
                ? "border-amber-400/60 bg-amber-500/10"
                : "border-white/20 bg-white/5"
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
                  className="max-h-40 rounded-lg object-contain"
                />
                <p className="text-xs text-white/50">Değiştirmek için tıkla</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                <ImageIcon className="mb-2 h-9 w-9 text-white/40" />
                <p className="text-sm text-white/80">
                  {isDragging ? "Bırak" : "Sürükle veya seç"}
                </p>
                <p className="mt-1 text-[11px] text-white/40">JPG, PNG, WEBP · max 10MB</p>
              </div>
            )}
            {uploadProgress !== null ? (
              <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-center text-[11px] text-white/55">
                  {uploadProgress}%
                </p>
              </div>
            ) : null}
          </div>
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

        <AdminSaveBar loading={loading} label="Yükle" />
      </div>
    </form>
  );
}
