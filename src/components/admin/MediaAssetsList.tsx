"use client";

import { getVideoEmbedUrl } from "@/lib/utils/embed";
import { Image, Video, Link2, Film } from "lucide-react";

interface MediaItem {
  id: string;
  content_id: string | null;
  kind: string;
  url: string;
  caption: string | null;
}

function MediaPreview({ item }: { item: MediaItem }) {
  const embedUrl = getVideoEmbedUrl(item.url);

  if (embedUrl) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={embedUrl}
          title={item.caption ?? "Video preview"}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (item.kind === "image") {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-[var(--card-border)]">
        <img
          src={item.url}
          alt={item.caption ?? ""}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  if (item.kind === "video") {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <video src={item.url} controls className="h-full w-full" />
      </div>
    );
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex aspect-video w-full items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--card)] transition hover:border-[var(--accent)]/50"
    >
      <Link2 className="h-10 w-10 text-[var(--muted)]" />
    </a>
  );
}

export function MediaAssetsList({
  media,
}: {
  media: MediaItem[];
}) {
  if (media.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] py-12 text-center text-[var(--muted)]">
        No media assets yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {media.map((item) => {
        const embedUrl = getVideoEmbedUrl(item.url);
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]"
          >
            <div className="p-2">
              <MediaPreview item={item} />
            </div>
            <div className="border-t border-[var(--card-border)] px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                {embedUrl ? (
                  <Film className="h-3.5 w-3.5" />
                ) : item.kind === "image" ? (
                  <Image className="h-3.5 w-3.5" />
                ) : item.kind === "video" ? (
                  <Video className="h-3.5 w-3.5" />
                ) : (
                  <Link2 className="h-3.5 w-3.5" />
                )}
                <span className="capitalize">{item.kind}</span>
                {item.content_id && (
                  <span className="truncate font-mono text-[10px]">
                    {item.content_id.slice(0, 8)}…
                  </span>
                )}
              </div>
              {item.caption && (
                <p className="mt-1 line-clamp-2 text-sm text-[var(--foreground)]">
                  {item.caption}
                </p>
              )}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block truncate text-xs text-[var(--accent)] hover:underline"
              >
                {item.url}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
