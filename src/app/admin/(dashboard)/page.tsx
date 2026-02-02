import { getAdminRecentItems } from "@/lib/db/queries";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminDashboardPage() {
  const recentItems = await getAdminRecentItems();

  return <AdminDashboard recentItems={recentItems} />;
}
