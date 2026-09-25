import { BarChart3 } from "lucide-react";
import { listYapilacaklar } from "@/lib/kisisel/yapilacaklar";
import { listBeslenme } from "@/lib/takip/beslenme";
import { listSpor } from "@/lib/takip/spor";
import { listFinansKayitlari } from "@/lib/takip/finans";
import {
  listAliskanlikKayitlari,
  listAliskanliklar,
} from "@/lib/takip/aliskanliklar";
import { getBooks } from "@/lib/queries";
import { AdminIstatistiklerPanel } from "@/components/admin/AdminIstatistiklerPanel";

export const dynamic = "force-dynamic";

export default async function AdminIstatistiklerPage() {
  const [
    yapilacaklar,
    beslenme,
    spor,
    finansKayitlari,
    aliskanlikKayitlari,
    aliskanliklar,
    books,
  ] = await Promise.all([
    listYapilacaklar(),
    listBeslenme(),
    listSpor(),
    listFinansKayitlari(),
    listAliskanlikKayitlari(),
    listAliskanliklar(),
    getBooks(true),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
          <BarChart3 className="h-6 w-6 text-[#b8934a]" />
          İstatistikler
        </h1>
        <p className="mt-2 text-sm text-[#6b6158]">
          Tüm kişisel takip verilerinin özeti.
        </p>
      </header>
      <AdminIstatistiklerPanel
        yapilacaklar={yapilacaklar}
        beslenme={beslenme}
        spor={spor}
        finansKayitlari={finansKayitlari}
        aliskanlikKayitlari={aliskanlikKayitlari}
        aliskanliklar={aliskanliklar}
        books={books}
      />
    </div>
  );
}
