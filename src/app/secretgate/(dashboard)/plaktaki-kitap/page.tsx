import Link from "next/link";
import { ArrowUpRight, Video } from "lucide-react";
import { AdminPlaktakiKitapSettingsForm } from "@/components/admin/AdminPlaktakiKitapSettingsForm";
import { AdminPlaktakiKitapItemsManager } from "@/components/admin/AdminPlaktakiKitapItemsManager";

export default function AdminPlaktakiKitapPage() {
  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
              <Video className="h-6 w-6 text-[#b8934a]" />
              Plaktaki Kitap
            </h1>
            <p className="mt-2 text-sm text-[#6b6158]">
              Intro metni, YouTube/Spotify linkleri ve videolar/sesli kitaplar.
              Tamamı /plaktaki-kitap sayfasında yayınlanır.
            </p>
          </div>
          <Link
            href="/plaktaki-kitap"
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
          <h2 className="mb-4 text-lg font-medium text-[#1a1612]">Ayarlar</h2>
          <AdminPlaktakiKitapSettingsForm />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-medium text-[#1a1612]">Videolar & Sesli Kitaplar</h2>
          <AdminPlaktakiKitapItemsManager />
        </div>
      </div>
    </div>
  );
}
