import { Smartphone } from "lucide-react";
import { listIcHesaplar, listIcIcerikler } from "@/lib/icerik";
import { AdminIcerikPanel } from "@/components/admin/icerik/AdminIcerikPanel";

export const dynamic = "force-dynamic";

export default async function AdminIcerikPage() {
  const [hesaplar, icerikler] = await Promise.all([
    listIcHesaplar({ includeInactive: true }),
    listIcIcerikler(),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-white">
          <Smartphone className="h-6 w-6 text-amber-400" />
          İçerik
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Altı hesap · story / post / reel / video · iki günde bir hedef
        </p>
      </header>
      <AdminIcerikPanel
        initialHesaplar={hesaplar}
        initialIcerikler={icerikler}
      />
    </div>
  );
}
