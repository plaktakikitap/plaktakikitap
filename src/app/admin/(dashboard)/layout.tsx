import { Suspense } from "react";
import { requireAdmin } from "@/lib/supabase/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminToast } from "@/components/admin/AdminToast";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="admin-command-center min-h-screen text-white/95">
      <AdminNav user={user} />
      <main className="min-h-screen pt-14 lg:ml-[72px] lg:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12 lg:px-10">
          {children}
        </div>
      </main>
      <Suspense fallback={null}>
        <AdminToast />
      </Suspense>
    </div>
  );
}
