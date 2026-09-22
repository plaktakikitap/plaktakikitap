import { CalendarDays } from "lucide-react";
import { listNotlar } from "@/lib/kisisel/notlar";
import { listYapilacaklar } from "@/lib/kisisel/yapilacaklar";
import { AdminTakvimPanel } from "@/components/admin/AdminTakvimPanel";

export const dynamic = "force-dynamic";

export default async function AdminTakvimPage() {
  const [notlar, yapilacaklar] = await Promise.all([
    listNotlar(),
    listYapilacaklar(),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
          <CalendarDays className="h-6 w-6 text-[#b8934a]" />
          Takvim & Notlar
        </h1>
        <p className="mt-2 text-sm text-[#6b6158]">
          Sadece senin için — ziyaretçilere kapalı.
        </p>
      </header>
      <AdminTakvimPanel
        initialNotlar={notlar}
        initialYapilacaklar={yapilacaklar}
      />
    </div>
  );
}
