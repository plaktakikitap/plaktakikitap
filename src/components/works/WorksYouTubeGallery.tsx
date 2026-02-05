"use client";

function getYouTubeEmbedId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const m = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

type Video = { id: string; title: string; youtube_url: string; order_index: number };

export function WorksYouTubeGallery({ videos }: { videos: Video[] }) {
  if (videos.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="mb-6 font-editorial text-2xl font-medium text-white sm:text-3xl">
        YouTube
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => {
          const embedId = getYouTubeEmbedId(v.youtube_url);
          if (!embedId) return null;
          return (
            <div
              key={v.id}
              className="group relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/30 shadow-xl"
            >
              <iframe
                src={`https://www.youtube.com/embed/${embedId}?rel=0`}
                title={v.title || "YouTube video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
              <div
                className="absolute inset-0 flex items-center justify-center rounded-xl border border-white/10 bg-[#050A14]/85 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-0"
                aria-hidden
              >
                <span className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
                  {v.title || "Video"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
