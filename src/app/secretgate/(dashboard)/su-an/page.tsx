import { Music } from "lucide-react";
import { getManualNowPlayingList, getCurrentReading } from "@/lib/db/queries";
import { getSiteSettings } from "@/lib/site-settings";
import { QuickNowForm } from "@/components/admin/QuickNowForm";

export const dynamic = "force-dynamic";

export default async function AdminSuAnPage() {
  let music: {
    id?: string;
    title: string;
    artist: string;
    album_art_url: string;
  } | null = null;

  let reading: {
    book_title: string;
    author: string;
    cover_url: string;
  } | null = null;

  let musicSource: "lastfm" | "manuel" = "lastfm";

  try {
    const tracks = await getManualNowPlayingList();
    const active = tracks.find((t) => t.is_active) ?? tracks[0] ?? null;
    if (active) {
      music = {
        id: active.id,
        title: active.title ?? "",
        artist: active.artist ?? "",
        album_art_url: active.album_art_url ?? "",
      };
    }
  } catch {
    /* empty */
  }

  try {
    const book = await getCurrentReading();
    if (book) {
      reading = {
        book_title: book.title ?? "",
        author: book.author ?? "",
        cover_url: book.cover_url ?? "",
      };
    }
  } catch {
    /* empty */
  }

  try {
    const settings = await getSiteSettings();
    musicSource = settings?.music_source === "manuel" ? "manuel" : "lastfm";
  } catch {
    /* empty */
  }

  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
          <Music className="h-6 w-6 text-[#b8934a]" />
          Şu an
        </h1>
        <p className="mt-2 text-sm text-[#6b6158]">
          Ana sayfadaki dinliyorum kartını güncelle. Okuduğun kitap Kütüphanem&apos;den işaretlenir.
        </p>
      </header>
      <QuickNowForm music={music} reading={reading} musicSource={musicSource} />
    </div>
  );
}
