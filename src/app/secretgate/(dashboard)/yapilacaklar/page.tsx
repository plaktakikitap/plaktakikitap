import { CheckSquare } from "lucide-react";
import { listYapilacaklar } from "@/lib/kisisel/yapilacaklar";
import { AdminYapilacaklarPanel } from "@/components/admin/AdminYapilacaklarPanel";

export const dynamic = "force-dynamic";

export default async function AdminYapilacaklarPage() {
  const items = await listYapilacaklar();

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-white">
          <CheckSquare className="h-6 w-6 text-amber-400" />
          Yapılacaklar
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Acil · Normal · Bekleyebilir — kişisel görev listesi.
        </p>
      </header>
      <AdminYapilacaklarPanel initialItems={items} />
    </div>
  );
}
