import Link from "next/link";
import { ArrowUpRight, Languages } from "lucide-react";
import {
  getTranslationsSettings,
  getTranslationBooksPublic,
  getTranslationIndependentPublic,
  getTranslationVolunteerPublic,
} from "@/lib/db/queries";
import { AdminTranslationsSettingsForm } from "@/components/admin/AdminTranslationsSettingsForm";
import { AdminTranslationBooksPanel } from "@/components/admin/AdminTranslationBooksPanel";
import { AdminTranslationIndependentPanel } from "@/components/admin/AdminTranslationIndependentPanel";
import { AdminTranslationVolunteerPanel } from "@/components/admin/AdminTranslationVolunteerPanel";

export const dynamic = "force-dynamic";

export default async function AdminTranslationsPage() {
  const [settings, books, independent, volunteer] = await Promise.all([
    getTranslationsSettings(),
    getTranslationBooksPublic(),
    getTranslationIndependentPublic(),
    getTranslationVolunteerPublic(),
  ]);

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="admin-heading flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
              <Languages className="h-6 w-6 text-[#b8934a]" />
              Çeviriler
            </h1>
            <p className="mt-2 text-sm text-[#6b6158]">
              Giriş metni, yayınlanmış kitaplar, bağımsız çeviriler ve gönüllü projeler.
              Tamamı /translations sayfasında yayınlanır.
            </p>
          </div>
          <Link
            href="/translations"
            target="_blank"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2 text-xs text-[#6b6158] transition-colors hover:border-[rgba(184,147,74,0.35)] hover:text-[#b8934a]"
          >
            Siteyi gör
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <div className="space-y-10">
        <div>
          <h2 className="admin-section-title mb-4">Ayarlar</h2>
          <AdminTranslationsSettingsForm settings={settings} />
        </div>
        <div>
          <h2 className="admin-section-title mb-4">Yayınlanmış kitaplar</h2>
          <AdminTranslationBooksPanel books={books} />
        </div>
        <div>
          <h2 className="admin-section-title mb-4">Bağımsız çeviriler</h2>
          <AdminTranslationIndependentPanel items={independent} />
        </div>
        <div>
          <h2 className="admin-section-title mb-4">Gönüllü projeler</h2>
          <AdminTranslationVolunteerPanel projects={volunteer} />
        </div>
      </div>
    </div>
  );
}
