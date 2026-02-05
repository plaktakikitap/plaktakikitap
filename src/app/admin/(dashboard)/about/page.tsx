import { createAdminClient } from "@/lib/supabase/admin";
import { AdminAboutTimelineForm } from "@/components/admin/AdminAboutTimelineForm";

export default async function AdminAboutPage() {
  const supabase = createAdminClient();
  const { data: entries } = await supabase
    .from("about_timeline")
    .select("*")
    .order("order_index", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-semibold">Beni Tanıyın — Timeline</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Narrative timeline paragrafları ve Polaroid görselleri
      </p>
      <AdminAboutTimelineForm entries={entries ?? []} />
    </div>
  );
}
