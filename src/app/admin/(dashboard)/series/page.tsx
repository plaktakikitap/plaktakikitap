import Link from "next/link";
import { motion } from "framer-motion";
import { getSeries } from "@/lib/queries";
import { Plus, Pencil } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminSeriesPage() {
  const series = await getSeries(true);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Diziler</h1>
          <p className="mt-1 text-[var(--muted)]">{series.length} dizi</p>
        </div>
        <Link
          href="/admin/series/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Yeni Dizi
        </Link>
      </div>

      <div className="space-y-2">
        {series.map((item, i) => {
          const s = Array.isArray(item.series) ? item.series[0] : item.series;
          if (!s) return null;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-3"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-[var(--muted)]">
                  {s.episodes_watched} bölüm • {item.visibility}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/series/${item.id}/edit`}
                  className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteButton id={item.id} type="series" label={item.title} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {series.length === 0 && (
        <p className="text-center text-[var(--muted)]">Henüz dizi eklenmemiş.</p>
      )}
    </div>
  );
}
