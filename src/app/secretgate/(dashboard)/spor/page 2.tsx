import { Dumbbell } from "lucide-react";
import { listSpor } from "@/lib/takip/spor";
import { AdminSporPanel } from "@/components/admin/AdminSporPanel";

export const dynamic = "force-dynamic";

export default async function AdminSporPage() {
  const from = new Date();
  from.setDate(from.getDate() - 120);
  const items = await listSpor({
    from: from.toISOString().slice(0, 10),
    limit: 400,
  });

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-white">
          <Dumbbell className="h-6 w-6 text-amber-400" />
          Spor
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Antrenman kaydı + aylık heatmap.
        </p>
      </header>
      <AdminSporPanel initialItems={items} />
    </div>
  );
}
