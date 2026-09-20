"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Play, Disc3 } from "lucide-react";
import type { PlaktakiKitapSettingsRow, PlaktakiKitapItemRow } from "@/lib/plaktaki-kitap";
import { PlaktakiKitapIntro } from "./PlaktakiKitapIntro";

const PlaktakiKitapPlayerModal = dynamic(
  () => import("./PlaktakiKitapPlayerModal").then((m) => ({ default: m.PlaktakiKitapPlayerModal })),
  { ssr: false }
);

type Props = {
  settings: PlaktakiKitapSettingsRow | null;
  items: PlaktakiKitapItemRow[];
};

export function PlaktakiKitapContent({ settings, items }: Props) {
  const [selected, setSelected] = useState<PlaktakiKitapItemRow | null>(null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  /** Videolar şimdilik listelenmiyor; veriler duruyor. */
  const audioBooks = useMemo(() => items.filter((i) => i.type === "audio_book"), [items]);

  const filteredAudio = useMemo(() => {
    let out = audioBooks;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(
        (i) => i.title.toLowerCase().includes(q) || (i.description?.toLowerCase().includes(q) ?? false)
      );
    }
    if (tagFilter) {
      out = out.filter((i) => i.tags?.includes(tagFilter));
    }
    return out;
  }, [audioBooks, search, tagFilter]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    audioBooks.forEach((i) => i.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [audioBooks]);

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8 text-center">
          <h1 className="font-editorial text-3xl font-semibold text-ink sm:text-4xl">Plaktaki Kitap</h1>
          <p className="mt-2 text-sm text-ink/60">YouTube kanalı</p>
        </header>

        <PlaktakiKitapIntro settings={settings} />

        {(allTags.length > 0 || audioBooks.length > 6) && (
          <div className="mt-2 mb-6 flex flex-wrap items-center gap-3">
            <input
              type="search"
              placeholder="Başlık veya açıklama ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs rounded-lg border border-ink/15 bg-ink/5 px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
            />
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTagFilter(null)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${tagFilter === null ? "bg-amber-500/25 text-gold" : "bg-ink/5 text-ink/70 hover:bg-ink/[0.06]"}`}
                >
                  Tümü
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${tagFilter === tag ? "bg-amber-500/25 text-gold" : "bg-ink/5 text-ink/70 hover:bg-ink/[0.06]"}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {filteredAudio.length > 0 && (
          <section>
            <h2 className="mb-6 font-editorial text-xl font-medium text-ink sm:text-2xl">Sesli Kitaplar</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredAudio.map((item, i) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.2) }}
                  className="group flex items-center gap-4 rounded-xl border border-ink/10 bg-ink/5 py-4 pl-4 pr-4 transition hover:-translate-y-0.5 hover:border-amber-400/20 focus-within:ring-2 focus-within:ring-amber-400/40"
                >
                  <div className="flex shrink-0 items-center justify-center">
                    <Disc3 className="h-14 w-14 text-gold/80 transition-transform duration-300 group-hover:animate-spin" style={{ animationDuration: "4s" }} strokeWidth={1.2} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink/95">{item.title || "—"}</p>
                    {item.description && <p className="mt-0.5 line-clamp-2 text-sm text-ink/60">{item.description}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="shrink-0 rounded-full bg-gold-soft p-3 text-gold transition hover:bg-amber-500/30 focus:outline-none focus:ring-2 focus:ring-gold/50"
                    aria-label={`Dinle: ${item.title}`}
                  >
                    <Play className="h-5 w-5 fill-amber-200" />
                  </button>
                </motion.article>
              ))}
            </div>
          </section>
        )}

        {audioBooks.length > 0 && filteredAudio.length === 0 && (
          <p className="py-8 text-center text-ink/60">Arama veya filtreye uygun öğe yok.</p>
        )}

        {audioBooks.length === 0 && (
          <p className="py-16 text-center text-ink/60">Henüz sesli kitap eklenmemiş.</p>
        )}
      </div>

      <PlaktakiKitapPlayerModal item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
