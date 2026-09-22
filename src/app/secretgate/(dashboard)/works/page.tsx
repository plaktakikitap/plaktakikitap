import Link from "next/link";
import { Briefcase, ArrowUpRight } from "lucide-react";
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
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="admin-heading flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
              <Briefcase className="h-6 w-6 text-[#b8934a]" />
              Yaptıklarım — Yetenek Vitrini
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6b6158]">
              Videolar, fotoğraflar, projeler, sertifikalar ve CV içeriğini yönetin. Görünürlük,
              sıralama ve öne çıkarma ayarları buradan yapılır.
            </p>
          </div>
          <Link
            href="/works"
            target="_blank"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2 text-xs text-[#6b6158] transition-colors hover:border-[rgba(184,147,74,0.35)] hover:text-[#b8934a]"
          >
            Siteyi gör
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <AdminWorksItemsPanel items={items} cvDownloadUrl={cvDownloadUrl} />
    </div>
  );
}
