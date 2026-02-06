"use client";

interface AdminLivePreviewProps {
  /** Görsel veya video URL */
  url: string | null;
  /** Video ise true */
  isVideo?: boolean;
  className?: string;
}

/** Fotoğraf/video yüklerken formun yanında gösterilecek canlı önizleme kutucuğu */
export function AdminLivePreview({ url, isVideo, className = "" }: AdminLivePreviewProps) {
  if (!url?.trim()) return null;

  return (
    <div
      className={`admin-bento-card flex flex-col items-center justify-center overflow-hidden rounded-2xl p-4 ${className}`}
    >
      <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-amber-400/80">
        Canlı Önizleme
      </p>
      {isVideo ? (
        <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-xl bg-black/40">
          {url.includes("youtube") || url.includes("youtu.be") ? (
            <iframe
              src={url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
              className="absolute inset-0 h-full w-full"
              allowFullScreen
              title="Video önizleme"
            />
          ) : (
            <video src={url} controls className="h-full w-full object-contain" />
          )}
        </div>
      ) : (
        <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-xl">
          <img
            src={url}
            alt="Önizleme"
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
