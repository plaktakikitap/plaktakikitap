"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

interface AdminImageUploadProps {
  name: string;
  value?: string;
  onChange?: (url: string) => void;
  placeholder?: string;
  className?: string;
  /** Form gönderiminde kullanılacak hidden input; controlled değilse name ile form'a eklenir */
  required?: boolean;
}

export function AdminImageUpload({
  name,
  value = "",
  onChange,
  placeholder = "Dosya seç veya sürükle",
  className = "",
  required = false,
}: AdminImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(value);
  useEffect(() => {
    if (!onChange) setUrl(value);
  }, [value, onChange]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayUrl = onChange ? value : url;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.set("file", file);

      const res = await fetch("/api/admin/upload/image", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Yükleme başarısız");
      }

      const newUrl = data.url;
      setUrl(newUrl);
      onChange?.(newUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme başarısız");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className={className}>
      <input type="hidden" name={name} value={displayUrl} required={required && !displayUrl} />
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("ring-2", "ring-amber-400/50"); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove("ring-2", "ring-amber-400/50"); }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("ring-2", "ring-amber-400/50");
          const file = e.dataTransfer.files?.[0];
          if (file?.type.startsWith("image/")) {
            const dt = new DataTransfer();
            dt.items.add(file);
            if (inputRef.current) inputRef.current.files = dt.files;
            inputRef.current?.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-6 transition-colors hover:bg-white/10 ${
          uploading ? "pointer-events-none opacity-70" : ""
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden
        />
        {displayUrl ? (
          <div className="relative">
            <img
              src={displayUrl}
              alt="Önizleme"
              className="max-h-32 rounded-lg object-cover"
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Değiştirmek için tıkla veya sürükle
            </p>
          </div>
        ) : (
          <>
            {uploading ? (
              <p className="text-sm text-[var(--muted-foreground)]">Yükleniyor…</p>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[var(--accent)]">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">{placeholder}</p>
              </>
            )}
          </>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
