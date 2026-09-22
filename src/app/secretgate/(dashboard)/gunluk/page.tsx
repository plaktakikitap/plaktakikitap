import { BookOpen } from "lucide-react";
import { listGunluk } from "@/lib/takip/gunluk";
import { AdminGunlukPanel } from "@/components/admin/AdminGunlukPanel";

export const dynamic = "force-dynamic";

export default async function AdminGunlukPage() {
  const items = await listGunluk({ limit: 120 });

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
          <BookOpen className="h-6 w-6 text-[#b8934a]" />
          Günlük
        </h1>
        <p className="mt-2 text-sm text-[#6b6158]">
          Günde bir yazı — otomatik kayıt (2 sn).
        </p>
      </header>
      <AdminGunlukPanel initialItems={items} />
    </div>
  );
}
