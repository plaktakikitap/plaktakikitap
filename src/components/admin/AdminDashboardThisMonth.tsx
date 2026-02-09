"use client";

import Link from "next/link";
import { Film, Tv, BookOpen } from "lucide-react";

const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function formatDate(s: string): string {
  try {
    const d = new Date(s);
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  } catch {
    return s;
  }
}

interface FilmsRow {
  id: string;
  title: string;
  duration_min: number;
  watched_at: string;
}
interface SeriesRow {
  id: string;
  title: string;
  episodes_watched: number;
  watched_at: string;
}
interface BooksRow {
  id: string;
  title: string;
  author: string | null;
  end_date: string;
}

interface AdminDashboardThisMonthProps {
  filmCount: number;
  seriesCount: number;
  booksCount: number;
  films: FilmsRow[];
  series: SeriesRow[];
  books: BooksRow[];
}

export function AdminDashboardThisMonth({
  filmCount,
  seriesCount,
  booksCount,
  films,
  series,
  books,
}: AdminDashboardThisMonthProps) {
  const now = new Date();
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  const total = filmCount + seriesCount + booksCount;
  const maxCount = Math.max(filmCount, seriesCount, booksCount, 1);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="admin-heading text-2xl font-semibold tracking-tight text-white/95">
          Bu Ay
        </h1>
        <p className="mt-1 text-sm text-white/55">{monthLabel} — özet</p>
      </header>

      {/* Özet kartlar */}
      <div className="grid grid-cols-3 gap-4">
        <Link
          href="/admin/films"
          className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/50">Film</p>
              <p className="admin-heading text-2xl font-semibold tabular-nums text-white">
                {filmCount}
              </p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-amber-500/70"
              style={{ width: `${(filmCount / maxCount) * 100}%` }}
            />
          </div>
        </Link>
        <Link
          href="/admin/series"
          className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Tv className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/50">Dizi</p>
              <p className="admin-heading text-2xl font-semibold tabular-nums text-white">
                {seriesCount}
              </p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-amber-500/70"
              style={{ width: `${(seriesCount / maxCount) * 100}%` }}
            />
          </div>
        </Link>
        <Link
          href="/admin/books"
          className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/50">Kitap</p>
              <p className="admin-heading text-2xl font-semibold tabular-nums text-white">
                {booksCount}
              </p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-amber-500/70"
              style={{ width: `${(booksCount / maxCount) * 100}%` }}
            />
          </div>
        </Link>
      </div>

      {total === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-white/50">
          Bu ay henüz film, dizi veya kitap eklenmemiş. İçerik eklemek için sol menüden Film / Dizi / Kitap sayfalarını kullanın.
        </p>
      ) : (
        <div className="space-y-8">
          {/* Tablolar */}
          {films.length > 0 && (
            <section>
              <h2 className="admin-heading mb-3 flex items-center gap-2 text-lg font-medium text-white/90">
                <Film className="h-4 w-4 text-amber-400" />
                Bu ay izlenen filmler
              </h2>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-medium uppercase tracking-wider text-white/50">
                      <th className="px-4 py-3">Başlık</th>
                      <th className="px-4 py-3 w-20 text-right">Süre</th>
                      <th className="px-4 py-3 w-24 text-right">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {films.map((row) => (
                      <tr key={row.id} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-2.5 font-medium text-white/90">{row.title}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-white/70">{row.duration_min} dk</td>
                        <td className="px-4 py-2.5 text-right text-white/60">{formatDate(row.watched_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {series.length > 0 && (
            <section>
              <h2 className="admin-heading mb-3 flex items-center gap-2 text-lg font-medium text-white/90">
                <Tv className="h-4 w-4 text-amber-400" />
                Bu ay izlenen diziler
              </h2>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-medium uppercase tracking-wider text-white/50">
                      <th className="px-4 py-3">Başlık</th>
                      <th className="px-4 py-3 w-20 text-right">Bölüm</th>
                      <th className="px-4 py-3 w-24 text-right">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {series.map((row) => (
                      <tr key={row.id} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-2.5 font-medium text-white/90">{row.title}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-white/70">{row.episodes_watched}</td>
                        <td className="px-4 py-2.5 text-right text-white/60">{formatDate(row.watched_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {books.length > 0 && (
            <section>
              <h2 className="admin-heading mb-3 flex items-center gap-2 text-lg font-medium text-white/90">
                <BookOpen className="h-4 w-4 text-amber-400" />
                Bu ay okunan kitaplar
              </h2>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-medium uppercase tracking-wider text-white/50">
                      <th className="px-4 py-3">Başlık</th>
                      <th className="px-4 py-3">Yazar</th>
                      <th className="px-4 py-3 w-24 text-right">Bitiş</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((row) => (
                      <tr key={row.id} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-2.5 font-medium text-white/90">{row.title}</td>
                        <td className="px-4 py-2.5 text-white/70">{row.author || "—"}</td>
                        <td className="px-4 py-2.5 text-right text-white/60">{formatDate(row.end_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      <p className="text-xs text-white/40">
        Film ve dizi eklemek için{" "}
        <Link href="/admin/films/new" className="text-amber-400/90 hover:underline">Film Ekle</Link>
        ,{" "}
        <Link href="/admin/series/new" className="text-amber-400/90 hover:underline">Dizi Ekle</Link>
        ,{" "}
        <Link href="/admin/books/new" className="text-amber-400/90 hover:underline">Kitap Ekle</Link>
        sayfalarını kullanın.
      </p>
    </div>
  );
}
