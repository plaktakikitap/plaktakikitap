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
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
              <Feather className="h-6 w-6 text-[#b8934a]" />
              {SECTION_TITLE}
            </h1>
            <p className="mt-2 text-sm text-[#6b6158]">
              Kısa not — başlık ve içerik yeterli.
            </p>
          </div>
          <Link
            href={SECTION_PATH}
            target="_blank"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2 text-xs text-[#6b6158] transition-colors hover:border-[rgba(184,147,74,0.35)] hover:text-[#b8934a]"
          >
            Siteyi gör
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <div className="space-y-10">
        <AdminKaralamalarForm recent={items} />
        <section>
          <h2 className="mb-4 text-sm font-medium text-[#6b6158]">
            Tüm kayıtlar
            <span className="ml-2 font-mono text-[10px] text-[#6b6158]">
              {SECTION_NAME}
            </span>
          </h2>
          <AdminKaralamalarList initialItems={items} />
        </section>
      </div>
    </div>
  );
}
