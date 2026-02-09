import {
  getCinemaStats,
  getBooksReadThisMonth,
  getFilmsWatchedThisMonthList,
  getSeriesWatchedThisMonthList,
  getBooksReadThisMonthList,
} from "@/lib/db/queries";
import { AdminDashboardThisMonth } from "@/components/admin/AdminDashboardThisMonth";
import { AdminSetupRequired } from "@/components/admin/AdminSetupRequired";
import { AdminSiteSounds } from "@/components/admin/AdminSiteSounds";

export default async function AdminDashboardPage() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || serviceRoleKey === "YOUR_SERVICE_ROLE_KEY") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <AdminSiteSounds />
        <AdminSetupRequired />
      </div>
    );
  }

  const [cinemaStats, booksReadThisMonth, filmsList, seriesList, booksList] = await Promise.all([
    getCinemaStats(),
    getBooksReadThisMonth(),
    getFilmsWatchedThisMonthList(),
    getSeriesWatchedThisMonthList(),
    getBooksReadThisMonthList(),
  ]);

  return (
    <div>
      <AdminDashboardThisMonth
        filmCount={cinemaStats.filmWatchedThisMonth}
        seriesCount={cinemaStats.seriesWatchedThisMonth}
        booksCount={booksReadThisMonth}
        films={filmsList}
        series={seriesList}
        books={booksList}
      />
    </div>
  );
}
