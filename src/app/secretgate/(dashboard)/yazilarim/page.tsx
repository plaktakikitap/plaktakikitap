import Link from "next/link";
import { FileText, ArrowUpRight } from "lucide-react";
import { getWritingsPublic } from "@/lib/writings";
import { AdminYazilarimForm } from "@/components/admin/AdminYazilarimForm";
import { AdminYazilarimList } from "@/components/admin/AdminYazilarimList";

export const dynamic = "force-dynamic";

export default async function AdminYazilarimPage() {
  const writings = await getWritingsPublic();

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="admin-heading flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
              <FileText className="h-6 w-6 text-[#b8934a]" />
              Yazılarım
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6b6158]">
              Denemeler, şiirler ve diğer metinler. Başlık ve tarih listelenir; içerik Rich Text
              (HTML) olarak saklanır.
            </p>
          </div>
          <Link
            href="/writings"
            target="_blank"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2 text-xs text-[#6b6158] transition-colors hover:border-[rgba(184,147,74,0.35)] hover:text-[#b8934a]"
          >
            Siteyi gör
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <div className="space-y-10">
        <AdminYazilarimForm />

        <section>
          <h2 className="admin-section-title mb-4">Mevcut yazılar</h2>
          <AdminYazilarimList initialWritings={writings} />
        </section>
      </div>
    </div>
  );
}
