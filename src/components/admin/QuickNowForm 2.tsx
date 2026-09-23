"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminCreateManualTrack,
  adminUpdateManualTrack,
  adminUpsertReadingStatus,
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
  note: string;
} | null;

export function QuickNowForm({
  music,
  reading,
}: {
  music?: MusicInitial;
  reading?: ReadingInitial;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  useAdminCmdEnter(formRef);

  const [songTitle, setSongTitle] = useState(music?.title ?? "");
  const [artist, setArtist] = useState(music?.artist ?? "");
  const [albumArt, setAlbumArt] = useState(music?.album_art_url ?? "");
  const [bookTitle, setBookTitle] = useState(reading?.book_title ?? "");
  const [author, setAuthor] = useState(reading?.author ?? "");
  const [coverUrl, setCoverUrl] = useState(reading?.cover_url ?? "");
  const [note, setNote] = useState(reading?.note ?? "");
  const [loading, setLoading] = useState(false);
  const [trackId] = useState(music?.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const hasMusic = songTitle.trim() || artist.trim();
    const hasBook = bookTitle.trim();
    if (!hasMusic && !hasBook) {
      showAdminToast("error", "En az bir şarkı veya kitap alanı doldurun.");
      return;
    }
    if (hasMusic && (!songTitle.trim() || !artist.trim())) {
      showAdminToast("error", "Şarkı için ad ve sanatçı gerekli.");
      return;
    }

    setLoading(true);
    try {
      if (hasMusic) {
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
      }

      if (hasBook) {
        const fd = new FormData();
        fd.set("book_title", bookTitle.trim());
        fd.set("author", author.trim());
        fd.set("cover_url", coverUrl.trim());
        fd.set("note", note.trim());
        fd.set("status", "reading");
        const result = await adminUpsertReadingStatus(fd);
        if (result?.error) {
          showAdminToast("error", result.error);
          setLoading(false);
          return;
        }
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
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
    >
      <div className="space-y-6">
        <section className="space-y-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
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
            <AdminFieldLabel htmlFor="now-album">Albüm kapağı URL</AdminFieldLabel>
            <AdminTextInput
              id="now-album"
              type="url"
              value={albumArt}
              onChange={(e) => setAlbumArt(e.target.value)}
              placeholder="https://…"
            />
          </div>
        </section>

        <div className="border-t border-white/10" />

        <section className="space-y-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
            Şu an okuyorum
          </p>
          <div>
            <AdminFieldLabel htmlFor="now-book">Kitap adı</AdminFieldLabel>
            <AdminTextInput
              id="now-book"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="Kitap"
            />
          </div>
          <div>
            <AdminFieldLabel htmlFor="now-author">Yazar</AdminFieldLabel>
            <AdminTextInput
              id="now-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Yazar"
            />
          </div>
          <div>
            <AdminFieldLabel htmlFor="now-cover">Kapak URL</AdminFieldLabel>
            <AdminTextInput
              id="now-cover"
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div>
            <AdminFieldLabel htmlFor="now-note">Not</AdminFieldLabel>
            <AdminTextInput
              id="now-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Opsiyonel"
            />
          </div>
        </section>

        <AdminSaveBar loading={loading} label="Güncelle" />
      </div>
    </form>
  );
}
