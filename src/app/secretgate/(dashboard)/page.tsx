import AdminDashboardPanel from "@/components/admin/AdminDashboardPanel";
import { AdminSetupRequired } from "@/components/admin/AdminSetupRequired";
import { AdminSiteSounds } from "@/components/admin/AdminSiteSounds";
import { getMorningDashboard } from "@/lib/admin/morning-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardSayfasi() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || serviceRoleKey === "YOUR_SERVICE_ROLE_KEY") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <AdminSiteSounds />
        <AdminSetupRequired />
      </div>
    );
  }

  const data = await getMorningDashboard();

  return <AdminDashboardPanel {...data} />;
}
