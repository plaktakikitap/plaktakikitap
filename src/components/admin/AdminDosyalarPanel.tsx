"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  File,
  FileText,
  Folder,
  FolderPlus,
  Image as ImageIcon,
  Trash2,
  Upload,
} from "lucide-react";
import type { KisiselDosya } from "@/types/kisisel";
import { showAdminToast } from "./admin-toast-events";

function formatBytes(n: number | null) {
  if (n == null || n <= 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function TypeIcon({ tur }: { tur: string | null }) {
  if (tur === "image") return <ImageIcon className="h-5 w-5 text-emerald-400" />;
  if (tur === "pdf") return <FileText className="h-5 w-5 text-red-400" />;
  if (tur === "folder") return <Folder className="h-5 w-5 text-white/40" />;
  return <File className="h-5 w-5 text-white/50" />;
}

export function AdminDosyalarPanel({
  initialFiles,
  initialFolders,
}: {
  initialFiles: KisiselDosya[];
  initialFolders: string[];
}) {
  const router = useRouter();
  const [files, setFiles] = useState(initialFiles);
  const [folders, setFolders] = useState(initialFolders);
  const [activeFolder, setActiveFolder] = useState(
    initialFolders[0] ?? "genel"
  );
  const [uploadFolder, setUploadFolder] = useState(
    initialFolders[0] ?? "genel"
  );
  const [progress, setProgress] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewKind, setPreviewKind] = useState<"image" | "pdf" | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(
    () =>
      files.filter(
        (f) => f.klasor === activeFolder && f.dosya_adi !== ".keep"
      ),
    [files, activeFolder]
  );

  const uploadFile = useCallback(
    async (file: File, klasor: string) => {
      setLoading(true);
      setProgress(0);
      try {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("klasor", klasor);
        const xhr = new XMLHttpRequest();
        const result = await new Promise<KisiselDosya>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });
          xhr.addEventListener("load", () => {
            try {
              const data = JSON.parse(xhr.responseText);
              if (xhr.status >= 200 && xhr.status < 300) resolve(data);
              else reject(new Error(data.error || "Yükleme başarısız"));
            } catch {
              reject(new Error("Geçersiz yanıt"));
            }
          });
          xhr.addEventListener("error", () => reject(new Error("Ağ hatası")));
          xhr.open("POST", "/api/admin/kisisel-dosyalar");
          xhr.send(fd);
        });
        setFiles((prev) => [result, ...prev]);
        if (!folders.includes(result.klasor)) {
          setFolders((prev) => [...prev, result.klasor].sort());
        }
        setActiveFolder(result.klasor);
        showAdminToast("success", "Dosya yüklendi ✓");
        router.refresh();
      } catch (err) {
        showAdminToast(
          "error",
          err instanceof Error ? err.message : "Yükleme başarısız."
        );
      } finally {
        setProgress(null);
        setLoading(false);
      }
    },
    [folders, router]
  );

  async function download(id: string) {
    try {
      const res = await fetch(`/api/admin/kisisel-dosyalar/${id}`);
      const data = await res.json();
      if (!res.ok) {
        showAdminToast("error", data.error || "İndirme başarısız.");
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      showAdminToast("error", "İndirme başarısız.");
    }
  }

  async function preview(file: KisiselDosya) {
    if (file.dosya_turu !== "image" && file.dosya_turu !== "pdf") {
      await download(file.id);
      return;
    }
    try {
      const res = await fetch(`/api/admin/kisisel-dosyalar/${file.id}`);
      const data = await res.json();
      if (!res.ok) {
        showAdminToast("error", data.error || "Önizleme açılamadı.");
        return;
      }
      setPreviewUrl(data.url);
      setPreviewKind(file.dosya_turu === "pdf" ? "pdf" : "image");
    } catch {
      showAdminToast("error", "Önizleme açılamadı.");
    }
  }

  async function remove(id: string) {
    if (!confirm("Dosyayı kalıcı olarak silmek istiyor musun?")) return;
    const res = await fetch(`/api/admin/kisisel-dosyalar/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      showAdminToast("error", "Silinemedi.");
      return;
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
    showAdminToast("success", "Silindi ✓");
    router.refresh();
  }

  async function createFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kisisel-dosyalar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-folder",
          klasor: newFolderName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAdminToast("error", data.error || "Klasör oluşturulamadı.");
        return;
      }
      setFolders((prev) =>
        prev.includes(data.klasor) ? prev : [...prev, data.klasor].sort()
      );
      setActiveFolder(data.klasor);
      setUploadFolder(data.klasor);
      setNewFolderName("");
      setShowNewFolder(false);
      showAdminToast("success", "Klasör oluşturuldu ✓");
      router.refresh();
    } catch {
      showAdminToast("error", "Klasör oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Folders */}
      <div className="flex flex-wrap items-center gap-2">
        {folders.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFolder(f)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs transition ${
              activeFolder === f
                ? "border-amber-400/40 bg-amber-500/15 text-amber-200"
                : "border-white/10 bg-white/[0.03] text-white/55 hover:text-white/80"
            }`}
          >
            <Folder className="h-3.5 w-3.5" />
            {f}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowNewFolder((o) => !o)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-white/20 px-3 py-1.5 text-xs text-white/45 hover:border-white/40 hover:text-white/70"
        >
          <FolderPlus className="h-3.5 w-3.5" />
          Yeni klasör
        </button>
      </div>

      {showNewFolder ? (
        <form onSubmit={createFolder} className="flex max-w-sm gap-2">
          <input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="klasör adı"
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-amber-500 px-3 py-2 text-sm text-black disabled:opacity-50"
          >
            Oluştur
          </button>
        </form>
      ) : null}

      {/* Upload */}
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
          const file = e.dataTransfer.files?.[0];
          if (file) void uploadFile(file, uploadFolder);
        }}
        className={`relative rounded-2xl border-2 border-dashed p-6 transition ${
          isDragging
            ? "border-amber-400/50 bg-amber-500/10"
            : "border-white/15 bg-white/[0.02]"
        }`}
      >
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <Upload className="h-8 w-8 text-white/40" />
            <div>
              <p className="text-sm text-white/80">
                {isDragging ? "Bırak" : "Sürükle veya dosya seç"}
              </p>
              <p className="text-[11px] text-white/40">Max 50MB · private bucket</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white outline-none"
            >
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50"
            >
              Seç
            </button>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadFile(f, uploadFolder);
                e.target.value = "";
              }}
            />
          </div>
        </div>
        {progress !== null ? (
          <div className="mt-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-center text-[11px] text-white/50">
              {progress}%
            </p>
          </div>
        ) : null}
      </div>

      {/* File list */}
      <section>
        <h3 className="mb-3 text-sm text-white/60">
          {activeFolder}{" "}
          <span className="text-white/30">({visible.length})</span>
        </h3>
        {visible.length === 0 ? (
          <p className="text-sm text-white/35">Bu klasör boş.</p>
        ) : (
          <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.02]">
            {visible.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03]"
              >
                <button
                  type="button"
                  onClick={() => void preview(file)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <TypeIcon tur={file.dosya_turu} />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white/90">
                      {file.dosya_adi}
                    </p>
                    <p className="text-[11px] text-white/40">
                      {formatBytes(file.boyut)} · {formatDate(file.olusturma_tarihi)}
                      {file.dosya_turu ? ` · ${file.dosya_turu}` : ""}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => void download(file.id)}
                  className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white"
                  aria-label="İndir"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void remove(file.id)}
                  className="rounded-lg p-2 text-white/40 hover:bg-red-500/20 hover:text-red-400"
                  aria-label="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Preview modal */}
      {previewUrl && previewKind ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => {
            setPreviewUrl(null);
            setPreviewKind(null);
          }}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setPreviewUrl(null);
                setPreviewKind(null);
              }}
              className="absolute right-3 top-3 z-10 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white/80"
            >
              Kapat
            </button>
            {previewKind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                className="max-h-[85vh] max-w-full object-contain"
              />
            ) : (
              <iframe
                src={previewUrl}
                title="PDF"
                className="h-[80vh] w-[min(90vw,800px)] bg-white"
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
