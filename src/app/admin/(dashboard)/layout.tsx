import { requireAdmin } from "@/lib/supabase/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminNav user={user} />
      <div className="pt-14">{children}</div>
    </div>
  );
}
