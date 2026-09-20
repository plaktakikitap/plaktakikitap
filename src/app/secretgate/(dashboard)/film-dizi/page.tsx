import Link from "next/link";
import { Film } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { QuickFilmSeriesForm } from "@/components/admin/QuickFilmSeriesForm";
import {
  ExcelIndirButonu,
  ExcelTumunuIndirButonu,
} from "@/components/admin/ExcelIndirButonu";

export const dynamic = "force-dynamic";

async function getRecentWatchItems() {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("content_items")
      .select("id, title, type, created_at")
      .in("type", ["film", "series"])
      .order("created_at", { ascending: false })
      .limit(5);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      title: (row.title as string) || "—",
      meta: `${row.type === "series" ? "Dizi" : "Film"} · ${new Date(
        row.created_at as string
      ).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}`,
    }));
  } catch {
    return [];
  }
}

export default async function AdminFilmDiziPage() {
  const recent = await getRecentWatchItems();

  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-white">
              <Film className="h-6 w-6 text-amber-400" />
              Film & Dizi
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Hızlı ekleme — detaylı formlar{" "}
              <Link
                href="/secretgate/movie-watch-log"
                className="text-amber-400/80 underline-offset-2 hover:underline"
              >
                Film
              </Link>
              {" / "}
              <Link
                href="/secretgate/series-watch-log"
                className="text-amber-400/80 underline-offset-2 hover:underline"
              >
                Dizi
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ExcelIndirButonu tur="filmler" />
          <ExcelIndirButonu tur="diziler" />
          <ExcelTumunuIndirButonu />
        </div>
      </header>

      <QuickFilmSeriesForm recent={recent} />
    </div>
  );
}
