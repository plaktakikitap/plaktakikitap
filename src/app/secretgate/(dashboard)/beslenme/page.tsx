import { Apple } from "lucide-react";
import { listBeslenme } from "@/lib/takip/beslenme";
import { listVucutOlcumleri } from "@/lib/takip/vucut";
import { AdminBeslenmePanel } from "@/components/admin/AdminBeslenmePanel";
import { AdminVucutOlcumPanel } from "@/components/admin/AdminVucutOlcumPanel";

export const dynamic = "force-dynamic";

export default async function AdminBeslenmePage() {
  const from = new Date();
  from.setDate(from.getDate() - 14);
  const [items, olcumler] = await Promise.all([
    listBeslenme({
      from: from.toISOString().slice(0, 10),
      limit: 200,
    }),
    listVucutOlcumleri(),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
          <Apple className="h-6 w-6 text-[#b8934a]" />
          Beslenme
        </h1>
        <p className="mt-2 text-sm text-[#6b6158]">
          Vücut ölçülerini tarihle tut, öğünleri ayrıca kaydet.
        </p>
      </header>
      <AdminVucutOlcumPanel initialItems={olcumler} />
      <div className="mt-14">
        <h2 className="mb-4 text-lg font-semibold text-[#1a1612]">Öğünler</h2>
        <AdminBeslenmePanel initialItems={items} />
      </div>
    </div>
  );
}
