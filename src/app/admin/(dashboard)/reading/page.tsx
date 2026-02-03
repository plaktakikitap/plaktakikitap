import { createAdminClient } from "@/lib/supabase/admin";
import { AdminReadingForm } from "@/components/admin/AdminReadingForm";

export default async function AdminReadingPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("reading_status")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-semibold">Şu an okuyorum</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Ana sayfadaki &quot;Şu an okuyorum&quot; / &quot;En son okuduğum&quot; kartını düzenleyin
      </p>
      <AdminReadingForm initial={data} />
    </div>
  );
}
