import Link from "next/link";
import { FileText } from "lucide-react";
import { getWritingsPublic } from "@/lib/writings";
import { AdminYazilarimForm } from "@/components/admin/AdminYazilarimForm";
import { AdminYazilarimList } from "@/components/admin/AdminYazilarimList";

export const dynamic = "force-dynamic";

export default async function AdminYazilarimPage() {
  const writings = await getWritingsPublic();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-xl font-semibold">
        <FileText className="h-5 w-5" />
        Yazılarım
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Denemeler, şiirler ve diğer metinler. Başlık ve tarih listelenir; içerik Rich Text (HTML) olarak saklanır.
      </p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-medium">Yeni yazı</h2>
          <AdminYazilarimForm />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-medium">Mevcut yazılar</h2>
          <AdminYazilarimList initialWritings={writings} />
        </section>
      </div>

      <p className="mt-6 text-sm text-[var(--muted)]">
        <Link href="/yazilarim" className="text-[var(--accent)] underline hover:no-underline">
          Yazılarım sayfasını görüntüle
        </Link>
      </p>
    </div>
  );
}
