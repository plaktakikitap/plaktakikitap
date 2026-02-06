import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminRecentItems, getCinemaStats, getTotalBooksCount, getBooksReadThisMonth } from "@/lib/db/queries";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminStatsStrip } from "@/components/admin/AdminStatsStrip";
import { AdminMiniPreview } from "@/components/admin/AdminMiniPreview";
import { AdminSetupRequired } from "@/components/admin/AdminSetupRequired";
import { AdminSiteSounds } from "@/components/admin/AdminSiteSounds";
import { AdminSection } from "@/components/admin/AdminSection";
import { AdminBentoCard } from "@/components/admin/AdminBentoCard";
import { AdminReadingCard } from "@/components/admin/AdminReadingCard";
import { AdminLinksCard } from "@/components/admin/AdminLinksCard";
import { AdminTracksCard } from "@/components/admin/AdminTracksCard";

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

  const supabase = createAdminClient();
  const [
    recentItems,
    readingResult,
    linksResult,
    tracksResult,
    cinemaStats,
    totalBooks,
    booksReadThisMonth,
  ] = await Promise.all([
    getAdminRecentItems(),
      supabase
        .from("reading_status")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("site_links")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("now_tracks")
        .select("*")
        .order("sort_order", { ascending: true }),
      getCinemaStats(),
      getTotalBooksCount(),
      getBooksReadThisMonth(),
    ]);

  const reading = readingResult.data ?? null;
  const links = linksResult.data ?? [];
  const tracks = tracksResult.data ?? [];

  return (
    <div className="space-y-16">
      {/* Hızlı İstatistikler */}
      <AdminStatsStrip
        totalBooks={totalBooks}
        totalFilms={cinemaStats.totalFilms}
        totalSeries={cinemaStats.totalSeries}
        filmWatchedThisMonth={cinemaStats.filmWatchedThisMonth}
        seriesWatchedThisMonth={cinemaStats.seriesWatchedThisMonth}
        booksReadThisMonth={booksReadThisMonth}
      />

      {/* İçerik Yönetimi — bento grid (AdminDashboard içinde AdminSection var) */}
      <AdminDashboard recentItems={recentItems} />

      {/* Medya & Widget'lar */}
      <AdminSection title="Medya & Widget'lar">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:auto-rows-[minmax(200px,auto)]">
          <AdminBentoCard colSpan={2} rowSpan={1}>
            <AdminReadingCard reading={reading} />
          </AdminBentoCard>
          <AdminBentoCard colSpan={2} rowSpan={2} className="min-h-[280px]">
            <AdminTracksCard tracks={tracks} />
          </AdminBentoCard>
          <AdminBentoCard colSpan={1} rowSpan={1}>
            <AdminSiteSounds />
          </AdminBentoCard>
        </div>
        <div className="mt-6">
          <AdminMiniPreview />
        </div>
      </AdminSection>

      {/* Site Ayarları */}
      <AdminSection title="Site Ayarları">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AdminBentoCard colSpan={2} rowSpan={1}>
            <AdminLinksCard links={links} />
          </AdminBentoCard>
        </div>
      </AdminSection>
    </div>
  );
}
