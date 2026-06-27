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
            <h1 className="admin-heading flex items-center gap-2.5 text-2xl font-semibold text-white">
              <FileText className="h-6 w-6 text-[#d4af37]" />
              Yazılarım
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50">
              Denemeler, şiirler ve diğer metinler. Başlık ve tarih listelenir; içerik Rich Text
              (HTML) olarak saklanır.
            </p>
          </div>
          <Link
            href="/writings"
            target="_blank"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/55 transition-colors hover:border-[rgba(212,175,55,0.35)] hover:text-[#d4af37]"
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
