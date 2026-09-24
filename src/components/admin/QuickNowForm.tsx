"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  adminCreateManualTrack,
  adminSetMusicSource,
  adminUpdateManualTrack,
} from "@/app/secretgate/actions";
import { showAdminToast } from "./admin-toast-events";
import {
  AdminFieldLabel,
  AdminSaveBar,
  AdminTextInput,
  useAdminCmdEnter,
} from "./AdminFormPrimitives";

type MusicInitial = {
  id?: string;
  title: string;
  artist: string;
  album_art_url: string;
} | null;

type ReadingInitial = {
  book_title: string;
  author: string;
  cover_url: string;
} | null;

export function QuickNowForm({
  music,
  reading,
  musicSource = "lastfm",
}: {
  music?: MusicInitial;
  reading?: ReadingInitial;
  musicSource?: "lastfm" | "manuel";
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  useAdminCmdEnter(formRef);

  const [source, setSource] = useState<"lastfm" | "manuel">(musicSource);
  const [savingSource, setSavingSource] = useState(false);
  const [songTitle, setSongTitle] = useState(music?.title ?? "");
  const [artist, setArtist] = useState(music?.artist ?? "");
  const [albumArt, setAlbumArt] = useState(music?.album_art_url ?? "");
  const [loading, setLoading] = useState(false);
  const [trackId] = useState(music?.id);

  useEffect(() => {
    setSource(musicSource);
  }, [musicSource]);

  async function handleSourceChange(s: "lastfm" | "manuel") {
    if (s === source) return;
    const prev = source;
    setSource(s);
    setSavingSource(true);
    try {
      const result = await adminSetMusicSource(s);
      if (result && "error" in result && result.error) {
        setSource(prev);
        showAdminToast("error", result.error);
        return;
      }
      router.refresh();
    } catch {
      setSource(prev);
      showAdminToast("error", "Kaynak kaydedilemedi.");
    } finally {
      setSavingSource(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (source !== "manuel") return;
    if (!songTitle.trim() || !artist.trim()) {
      showAdminToast("error", "Şarkı için ad ve sanatçı gerekli.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("title", songTitle.trim());
      fd.set("artist", artist.trim());
      fd.set("album_art_url", albumArt.trim());
      fd.set("is_active", "on");
      const result = trackId
        ? await adminUpdateManualTrack(trackId, fd)
        : await adminCreateManualTrack(fd);
      if (result && "error" in result && result.error) {
        showAdminToast("error", result.error);
        setLoading(false);
        return;
      }

      showAdminToast("success", "Güncellendi ✓");
      router.refresh();
    } catch {
      showAdminToast("error", "Güncelleme başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-5 sm:p-6"
    >
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#1a1612]/40">
            Müzik kaynağı
          </p>
          <div className="flex gap-1 rounded-xl border border-[#e8e0d4] bg-[#f4f0ea] p-1">
            {(["lastfm", "manuel"] as const).map((s) => (
              <button
                key={s}
                type="button"
                disabled={savingSource}
                onClick={() => handleSourceChange(s)}
                className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
                  source === s
                    ? "bg-white text-[#1a1612] shadow-sm"
                    : "text-[#6b6158] hover:text-[#1a1612]"
                }`}
              >
                {s === "lastfm" ? "Last.fm" : "Manuel"}
              </button>
            ))}
          </div>
          {source === "lastfm" ? (
            <p className="mt-2 text-xs text-[#6b6158]">
              Site şu an Last.fm&apos;i kullanıyor — en son çalınan şarkı otomatik
              gösteriliyor. Manuel girdiğin şarkı Last.fm hata verirse devreye
              girer.
            </p>
          ) : (
            <p className="mt-2 text-xs text-[#6b6158]">
              Site şu an manuel şarkıyı kullanıyor — aşağıda girdiğin şarkı
              gösteriliyor. Last.fm scrobble yine de çalışıyor ama öncelik sende.
            </p>
          )}
        </div>

        {source === "manuel" && (
          <>
            <section className="space-y-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#1a1612]/40">
                Şu an dinliyorum
              </p>
              <div>
                <AdminFieldLabel htmlFor="now-song">Şarkı adı</AdminFieldLabel>
                <AdminTextInput
                  id="now-song"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="Şarkı"
                />
              </div>
              <div>
                <AdminFieldLabel htmlFor="now-artist">Sanatçı</AdminFieldLabel>
                <AdminTextInput
                  id="now-artist"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Sanatçı"
                />
              </div>
              <div>
                <AdminFieldLabel htmlFor="now-album">
                  Albüm kapağı URL
                </AdminFieldLabel>
                <AdminTextInput
                  id="now-album"
                  type="url"
                  value={albumArt}
                  onChange={(e) => setAlbumArt(e.target.value)}
                  placeholder="https://…"
                />
              </div>
            </section>
            <div className="border-t border-[#e8e0d4]" />
          </>
        )}

        <section className="space-y-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#1a1612]/40">
            Şu an okuyorum
          </p>
          {reading?.book_title ? (
            <div className="flex gap-3 rounded-xl border border-[#e8e0d4] bg-[#faf7f2] p-3">
              {reading.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={reading.cover_url}
                  alt=""
                  className="h-14 w-10 shrink-0 rounded object-cover shadow-sm"
                />
              ) : null}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#1a1612]">
                  {reading.book_title}
                </p>
                {reading.author ? (
                  <p className="text-xs text-[#6b6158]">{reading.author}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#6b6158]">
              Sitede henüz bir kitap görünmüyor.
            </p>
          )}
          <Link
            href="/secretgate/okunacaklar"
            className="inline-block text-xs font-medium text-[#b8934a] hover:underline"
          >
            Kütüphanem&apos;den işaretle →
          </Link>
        </section>

        {source === "manuel" ? (
          <AdminSaveBar loading={loading} label="Güncelle" />
        ) : null}
      </div>
    </form>
  );
}
