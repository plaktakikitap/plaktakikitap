import Link from "next/link";
import { Feather, ArrowUpRight } from "lucide-react";
import { getKaralamalarAdmin } from "@/lib/karalamalar";
import {
  SECTION_NAME,
  SECTION_PATH,
  SECTION_TITLE,
} from "@/lib/karalamalar-section";
import { AdminKaralamalarForm } from "@/components/admin/AdminKaralamalarForm";
import { AdminKaralamalarList } from "@/components/admin/AdminKaralamalarList";

export const dynamic = "force-dynamic";

export default async function AdminKaralamalarPage() {
  const items = await getKaralamalarAdmin();

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-white">
              <Feather className="h-6 w-6 text-[#d4af37]" />
              {SECTION_TITLE}
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Kısa not — başlık ve içerik yeterli.
            </p>
          </div>
          <Link
            href={SECTION_PATH}
            target="_blank"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/55 transition-colors hover:border-[rgba(212,175,55,0.35)] hover:text-[#d4af37]"
          >
            Siteyi gör
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <div className="space-y-10">
        <AdminKaralamalarForm recent={items} />
        <section>
          <h2 className="mb-4 text-sm font-medium text-white/60">
            Tüm kayıtlar
            <span className="ml-2 font-mono text-[10px] text-white/30">
              {SECTION_NAME}
            </span>
          </h2>
          <AdminKaralamalarList initialItems={items} />
        </section>
      </div>
    </div>
  );
}
