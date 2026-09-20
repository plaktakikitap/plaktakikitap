import { Music } from "lucide-react";
import { getManualNowPlayingList } from "@/lib/db/queries";
import { createAdminClient } from "@/lib/supabase/admin";
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
    note: string;
  } | null = null;

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
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("reading_status")
      .select("book_title, author, cover_url, note")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      reading = {
        book_title: data.book_title ?? "",
        author: data.author ?? "",
        cover_url: data.cover_url ?? "",
        note: data.note ?? "",
      };
    }
  } catch {
    /* empty */
  }

  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-white">
          <Music className="h-6 w-6 text-amber-400" />
          Şu an
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Ana sayfadaki dinliyorum / okuyorum kartlarını güncelle.
        </p>
      </header>

      <QuickNowForm music={music} reading={reading} />
    </div>
  );
}
