import { Tv } from "lucide-react";
import { AdminDizilerPanel } from "@/components/admin/AdminDizilerPanel";
import { getAdminSeriesList } from "@/lib/series-catalog";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export default async function AdminDizilerPage() {
  const series = await getAdminSeriesList();

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-white">
          <Tv className="h-6 w-6 text-amber-400" />
          Diziler
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Dizi ekle, durum, bölüm işaretleme ve TMDB yenileme.
        </p>
      </header>
      <AdminDizilerPanel initialSeries={series} />
    </div>
  );
}
