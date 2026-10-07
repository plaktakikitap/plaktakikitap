import { AdminMovieWatchLog } from "@/components/admin/AdminMovieWatchLog";
import { getMovieWatchLog } from "@/lib/movie-watch-log";

export const dynamic = "force-dynamic";

export default async function AdminMovieWatchLogPage() {
  let viewings: Awaited<ReturnType<typeof getMovieWatchLog>> = [];
  let loadError: string | null = null;
  try {
    viewings = await getMovieWatchLog();
  } catch (error) {
    console.error("Film izleme günlüğü:", error);
    loadError =
      error instanceof Error ? error.message : "Filmler yüklenemedi.";
  }

  return (
    <AdminMovieWatchLog initialViewings={viewings} loadError={loadError} />
  );
}
