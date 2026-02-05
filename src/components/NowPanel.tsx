import Image from "next/image";
import { supabaseServer } from "@/lib/supabase-server";
import ManualNowPlaying from "./ManualNowPlaying";

async function getNowTracks() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("now_tracks")
    .select("id, title, artist, duration_sec, cover_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as { id: string; title: string; artist: string; duration_sec: number | null; cover_url: string | null }[];
}

async function getReading() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("reading_status")
    .select("status, book_title, author, cover_url, note, updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}

function GlassCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-3xl">
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <p className="text-sm tracking-wide text-white/70">{title}</p>
      </div>
      <div className="px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">{children}</div>
    </div>
  );
}

export default async function NowPanel() {
  const [tracks, reading] = await Promise.all([
    getNowTracks(),
    getReading(),
  ]);

  const readingTitle =
    reading?.status === "reading" ? "Şu an okuyorum:" : "En son okuduğum:";

  return (
    <section className="mx-auto mt-12 w-full max-w-6xl px-4 sm:mt-16 sm:px-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-white/90">Şu an</h3>
        <span className="text-xs text-white/35">canlı köşe</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Şu an dinliyorum — manuel (now_tracks) */}
        <GlassCard title="Şu an dinliyorum:">
          <ManualNowPlaying tracks={tracks} />
        </GlassCard>

        {/* Reading */}
        <GlassCard title={readingTitle}>
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
              {reading?.cover_url ? (
                <Image
                  src={reading.cover_url}
                  alt="book cover"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white/90">
                {reading?.book_title ?? "—"}
              </p>
              <p className="truncate text-sm text-white/60">
                {reading?.author ?? " "}
              </p>

              {reading?.note ? (
                <p className="mt-2 line-clamp-2 text-xs text-white/55">
                  {reading.note}
                </p>
              ) : (
                <p className="mt-2 text-xs text-white/35">not: —</p>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
