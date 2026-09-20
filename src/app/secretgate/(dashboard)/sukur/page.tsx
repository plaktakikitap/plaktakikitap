import { Sparkles } from "lucide-react";
import { listSukur } from "@/lib/takip/sukur";
import { AdminSukurPanel } from "@/components/admin/AdminSukurPanel";

export const dynamic = "force-dynamic";

export default async function AdminSukurPage() {
  const items = await listSukur();

  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-white">
          <Sparkles className="h-6 w-6 text-amber-400" />
          Şükür
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Her gün üç şey.
        </p>
      </header>
      <AdminSukurPanel initialItems={items} />
    </div>
  );
}
