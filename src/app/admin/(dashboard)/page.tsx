import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminRecentItems } from "@/lib/db/queries";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminPanelMain } from "@/components/admin/AdminPanelMain";
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

  const supabase = createAdminClient();
  const [recentItems, readingResult, linksResult, tracksResult] =
    await Promise.all([
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
    ]);

  const reading = readingResult.data ?? null;
  const links = linksResult.data ?? [];
  const tracks = tracksResult.data ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <div className="flex flex-wrap gap-8">
        <AdminSiteSounds />
      </div>
      <AdminPanelMain reading={reading} links={links} tracks={tracks} />
      <AdminDashboard recentItems={recentItems} />
    </div>
  );
}
