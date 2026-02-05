"use client";

const CONTENT_TAGS = ["analog", "digital", "bw", "street", "istanbul"] as const;

export type ContentTag = (typeof CONTENT_TAGS)[number];

interface PhotosFilterBarProps {
  contentTag: ContentTag | null;
  cameraTag: string | null;
  cameraOptions: string[];
  onContentTagChange: (tag: ContentTag | null) => void;
  onCameraTagChange: (tag: string | null) => void;
}

export function PhotosFilterBar({
  contentTag,
  cameraTag,
  cameraOptions,
  onContentTagChange,
  onCameraTagChange,
}: PhotosFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-medium uppercase tracking-wider text-white/50">
        İçerik
      </span>
      {CONTENT_TAGS.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onContentTagChange(contentTag === tag ? null : tag)}
          className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
            contentTag === tag
              ? "bg-white/25 text-white"
              : "bg-white/10 text-white/80 hover:bg-white/20"
          }`}
        >
          #{tag}
        </button>
      ))}
      {cameraOptions.length > 0 && (
        <>
          <span className="ml-4 mr-1 text-xs font-medium uppercase tracking-wider text-white/50">
            Kamera
          </span>
          {cameraOptions.map((cam) => (
            <button
              key={cam}
              type="button"
              onClick={() => onCameraTagChange(cameraTag === cam ? null : cam)}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                cameraTag === cam
                  ? "bg-amber-500/30 text-amber-200"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              #{cam}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

export { CONTENT_TAGS };
