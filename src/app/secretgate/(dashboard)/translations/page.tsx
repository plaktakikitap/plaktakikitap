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
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default async function AdminTranslationsPage() {
  const [settings, books, independent, volunteer] = await Promise.all([
    getTranslationsSettings(),
    getTranslationBooksPublic(),
    getTranslationIndependentPublic(),
    getTranslationVolunteerPublic(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-xl font-semibold">
        <BookOpen className="h-5 w-5" />
        Çeviriler
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        /translations sayfası: ayarlar, yayınlanmış kitaplar, bağımsız çeviriler, gönüllü projeler. Kapak ve PDF yüklemek için Supabase Storage bucket’ları &quot;covers&quot; ve &quot;translation_files&quot; oluşturun (public read).
      </p>
      <div className="mt-8 space-y-10">
        <AdminTranslationsSettingsForm settings={settings} />
        <div>
          <h2 className="mb-4 text-lg font-medium">Yayınlanmış kitaplar</h2>
          <AdminTranslationBooksPanel books={books} />
        </div>
        <div>
          <h2 className="mb-4 text-lg font-medium">Bağımsız çeviriler</h2>
          <AdminTranslationIndependentPanel items={independent} />
        </div>
        <div>
          <h2 className="mb-4 text-lg font-medium">Gönüllü projeler</h2>
          <AdminTranslationVolunteerPanel projects={volunteer} />
        </div>
      </div>
      <p className="mt-6 text-sm text-[var(--muted)]">
        <Link href="/translations" className="text-[var(--accent)] underline hover:no-underline">
          Çeviriler sayfasını görüntüle
        </Link>
      </p>
    </div>
  );
}
