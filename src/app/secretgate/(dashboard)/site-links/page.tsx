import { createAdminClient } from "@/lib/supabase/admin";
import { AdminSiteLinksForm } from "@/components/admin/AdminSiteLinksForm";

export default async function AdminSiteLinksPage() {
  const supabase = createAdminClient();
  const { data: links } = await supabase
    .from("site_links")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-semibold">Site linkleri</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Footer&apos;daki &quot;Bana ulaşın&quot; linklerini yönetin
      </p>
      <AdminSiteLinksForm links={links ?? []} />
    </div>
  );
}
