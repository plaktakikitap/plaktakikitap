import { Apple } from "lucide-react";
import { listBeslenme } from "@/lib/takip/beslenme";
import { AdminBeslenmePanel } from "@/components/admin/AdminBeslenmePanel";

export const dynamic = "force-dynamic";

export default async function AdminBeslenmePage() {
  const from = new Date();
  from.setDate(from.getDate() - 14);
  const items = await listBeslenme({
    from: from.toISOString().slice(0, 10),
    limit: 200,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
          <Apple className="h-6 w-6 text-[#b8934a]" />
          Beslenme
        </h1>
        <p className="mt-2 text-sm text-[#6b6158]">
          Öğün gir → YZ analiz eder → kaydeder.
        </p>
      </header>
      <AdminBeslenmePanel initialItems={items} />
    </div>
  );
}
