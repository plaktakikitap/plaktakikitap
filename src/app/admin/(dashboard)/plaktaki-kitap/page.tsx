import Link from "next/link";
import { Video } from "lucide-react";
import { AdminPlaktakiKitapSettingsForm } from "@/components/admin/AdminPlaktakiKitapSettingsForm";
import { AdminPlaktakiKitapItemsManager } from "@/components/admin/AdminPlaktakiKitapItemsManager";

export default function AdminPlaktakiKitapPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-xl font-semibold">
        <Video className="h-5 w-5" />
        Plaktaki Kitap
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Intro metni, YouTube/Spotify linkleri ve videolar/sesli kitaplar. Tamamı /plaktaki-kitap sayfasında yayınlanır.
      </p>

      <div className="mt-8 space-y-10">
        <div>
          <h2 className="mb-4 text-lg font-medium">Ayarlar</h2>
          <AdminPlaktakiKitapSettingsForm />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-medium">Videolar & Sesli Kitaplar</h2>
          <AdminPlaktakiKitapItemsManager />
        </div>
      </div>

      <p className="mt-6 text-sm text-[var(--muted)]">
        <Link href="/plaktaki-kitap" className="text-[var(--accent)] underline hover:no-underline">
          Plaktaki Kitap sayfasını görüntüle
        </Link>
      </p>
    </div>
  );
}
