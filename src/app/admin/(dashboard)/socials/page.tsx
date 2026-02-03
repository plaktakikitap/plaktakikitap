import { createAdminClient } from "@/lib/supabase/admin";
import { AdminSocialsForm } from "@/components/admin/AdminSocialsForm";

export default async function AdminSocialsPage() {
  const supabase = createAdminClient();
  const { data: links } = await supabase
    .from("social_links")
    .select("*")
    .order("order_index", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-semibold">Bana Ulaşın — Sosyal Linkler</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Footer&apos;daki premium glassmorphism butonlarını yönetin
      </p>
      <AdminSocialsForm links={links ?? []} />
    </div>
  );
}
