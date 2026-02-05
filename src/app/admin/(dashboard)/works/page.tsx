import { createAdminClient } from "@/lib/supabase/admin";
import { getWorksAdmin } from "@/lib/works";
import { AdminWorksItemsPanel } from "@/components/admin/AdminWorksItemsPanel";

export default async function AdminWorksPage() {
  const items = await getWorksAdmin();
  const supabase = createAdminClient();
  const { data: settingsRow } = await supabase
    .from("works_settings")
    .select("value")
    .eq("key", "cv_download_url")
    .maybeSingle();
  const cvDownloadUrl = (settingsRow?.value as string) ?? "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-xl font-semibold">Yaptıklarım — Yetenek Vitrini</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        works_items: videolar, sanat, projeler, sertifikalar, CV. Görünürlük, etiketler, öne çıkan, sıra.
      </p>
      <AdminWorksItemsPanel items={items} cvDownloadUrl={cvDownloadUrl} />
    </div>
  );
}
