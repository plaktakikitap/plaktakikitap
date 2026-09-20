import { Wallet } from "lucide-react";
import {
  listFinansKayitlari,
  listFinansKategoriler,
} from "@/lib/takip/finans";
import { AdminFinansPanel } from "@/components/admin/AdminFinansPanel";

export const dynamic = "force-dynamic";

export default async function AdminFinansPage() {
  const from = new Date();
  from.setMonth(from.getMonth() - 18);
  const [kayitlar, kategoriler] = await Promise.all([
    listFinansKayitlari({
      from: from.toISOString().slice(0, 10),
      limit: 500,
    }),
    listFinansKategoriler(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-white">
          <Wallet className="h-6 w-6 text-amber-400" />
          Finans
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Gelir / gider — aylık özet.
        </p>
      </header>
      <AdminFinansPanel
        initialKayitlar={kayitlar}
        initialKategoriler={kategoriler}
      />
    </div>
  );
}
