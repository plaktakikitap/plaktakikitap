import { notFound } from "next/navigation";
import Link from "next/link";
import { getArtBySlug } from "@/lib/db/queries";
import { getVideoEmbedUrl } from "@/lib/utils/embed";
import { ArrowLeft, ImageIcon, Palette } from "lucide-react";

export default async function ArtDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getArtBySlug(slug);

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/art"
        className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Art
      </Link>

      <header className="mb-8">
        <h1 className="font-editorial text-3xl font-medium text-[var(--foreground)]">
          {item.title}
        </h1>
        {item.description && (
          <p className="mt-2 text-[var(--muted)]">{item.description}</p>
        )}
      </header>

      <div className="space-y-6">
        {item.media.length === 0 ? (
          <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
            <Palette className="h-16 w-16 text-[var(--muted)]" />
          </div>
        ) : (
          item.media.map((m) => {
            const embedUrl = getVideoEmbedUrl(m.url);
            return (
              <div key={m.id} className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
                {embedUrl ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={embedUrl}
                      title={m.caption ?? item.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : m.kind === "image" ? (
                  <img
                    src={m.url}
                    alt={m.caption ?? item.title}
                    className="w-full object-contain"
                  />
                ) : m.kind === "video" ? (
                  <video src={m.url} controls className="w-full" />
                ) : (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex aspect-video w-full items-center justify-center"
                  >
                    <ImageIcon className="h-12 w-12 text-[var(--muted)]" />
                  </a>
                )}
                {m.caption && (
                  <p className="border-t border-[var(--card-border)] px-4 py-2 text-sm text-[var(--muted)]">
                    {m.caption}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
