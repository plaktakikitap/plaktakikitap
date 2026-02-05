"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Disc3 } from "lucide-react";
import type { PlaktakiKitapSettingsRow, PlaktakiKitapItemRow } from "@/lib/plaktaki-kitap";
import { getPlaktakiKitapItemThumbUrl } from "@/lib/plaktaki-kitap";
import { getYouTubeHqDefaultThumbUrl } from "@/lib/works-utils";
import { PlaktakiKitapIntro } from "./PlaktakiKitapIntro";
import { PlaktakiKitapPlayerModal } from "./PlaktakiKitapPlayerModal";

type Props = {
  settings: PlaktakiKitapSettingsRow | null;
  items: PlaktakiKitapItemRow[];
};

export function PlaktakiKitapContent({ settings, items }: Props) {
  const [selected, setSelected] = useState<PlaktakiKitapItemRow | null>(null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const videos = useMemo(() => items.filter((i) => i.type === "video"), [items]);
  const audioBooks = useMemo(() => items.filter((i) => i.type === "audio_book"), [items]);

  const filterItems = (list: PlaktakiKitapItemRow[]) => {
    let out = list;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter((i) => i.title.toLowerCase().includes(q) || (i.description?.toLowerCase().includes(q)));
    }
    if (tagFilter) {
      out = out.filter((i) => i.tags?.includes(tagFilter));
    }
    return out;
  };

  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [items]);

  const filteredVideos = filterItems(videos);
  const filteredAudio = filterItems(audioBooks);

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8 text-center">
          <h1 className="font-editorial text-3xl font-semibold text-white sm:text-4xl">Plaktaki Kitap</h1>
          <p className="mt-2 text-sm text-white/60">YouTube kanalı</p>
        </header>

        <PlaktakiKitapIntro settings={settings} />

        {(allTags.length > 0 || items.length > 6) && (
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <input
              type="search"
              placeholder="Başlık veya açıklama ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
            />
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTagFilter(null)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${tagFilter === null ? "bg-amber-500/25 text-amber-200" : "bg-white/10 text-white/70 hover:bg-white/15"}`}
                >
                  Tümü
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${tagFilter === tag ? "bg-amber-500/25 text-amber-200" : "bg-white/10 text-white/70 hover:bg-white/15"}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {filteredVideos.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 font-editorial text-xl font-medium text-white sm:text-2xl">Videolar</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {filteredVideos.map((item, i) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.2) }}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-xl transition hover:-translate-y-0.5 hover:border-amber-400/20 hover:shadow-amber-900/10"
                >
                  <div className="relative aspect-video w-full">
                    <Image
                      src={item.custom_thumbnail_url?.startsWith("http") ? item.custom_thumbnail_url : getYouTubeHqDefaultThumbUrl(item.youtube_video_id)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#050A14]/70 opacity-0 transition group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      aria-label={`İzle: ${item.title}`}
                    >
                      <span className="line-clamp-2 max-w-full px-3 text-center text-sm font-medium text-white">{item.title || "Video"}</span>
                      <div className="rounded-full bg-white/20 p-3">
                        <Play className="h-6 w-6 fill-white text-white" />
                      </div>
                    </button>
                  </div>
                  <div className="border-t border-white/10 px-4 py-3">
                    <p className="line-clamp-2 text-sm font-medium text-white/95">{item.title || "—"}</p>
                    {item.description && <p className="mt-1 line-clamp-2 text-xs text-white/60">{item.description}</p>}
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        )}

        {filteredAudio.length > 0 && (
          <section>
            <h2 className="mb-6 font-editorial text-xl font-medium text-white sm:text-2xl">Sesli Kitaplar</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredAudio.map((item, i) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.2) }}
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 py-4 pl-4 pr-4 transition hover:-translate-y-0.5 hover:border-amber-400/20 focus-within:ring-2 focus-within:ring-amber-400/40"
                >
                  <div className="flex shrink-0 items-center justify-center">
                    <Disc3 className="h-14 w-14 text-amber-200/80 transition-transform duration-300 group-hover:animate-spin" style={{ animationDuration: "4s" }} strokeWidth={1.2} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white/95">{item.title || "—"}</p>
                    {item.description && <p className="mt-0.5 line-clamp-2 text-sm text-white/60">{item.description}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="shrink-0 rounded-full bg-amber-500/20 p-3 text-amber-200 transition hover:bg-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    aria-label={`Dinle: ${item.title}`}
                  >
                    <Play className="h-5 w-5 fill-amber-200" />
                  </button>
                </motion.article>
              ))}
            </div>
          </section>
        )}

        {items.length > 0 && filteredVideos.length === 0 && filteredAudio.length === 0 && (
          <p className="py-8 text-center text-white/60">Arama veya filtreye uygun öğe yok.</p>
        )}

        {items.length === 0 && (
          <p className="py-16 text-center text-white/60">Henüz video veya sesli kitap eklenmemiş.</p>
        )}
      </div>

      <PlaktakiKitapPlayerModal item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
