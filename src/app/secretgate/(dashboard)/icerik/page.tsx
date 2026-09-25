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
    <>
      <div className="mx-auto mb-8 max-w-xl">
        <header>
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
            <Smartphone className="h-6 w-6 text-[#b8934a]" />
            İçerik
          </h1>
          <p className="mt-2 text-sm text-[#6b6158]">
            Altı hesap · story / post / reel / video · iki günde bir hedef
          </p>
        </header>
      </div>
      <div className="mx-auto max-w-7xl">
        <AdminIcerikPanel
          initialHesaplar={hesaplar}
          initialIcerikler={icerikler}
        />
      </div>
    </>
  );
}
