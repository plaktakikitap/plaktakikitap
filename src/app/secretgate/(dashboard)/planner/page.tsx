import Link from "next/link";
import { QuickAjandaForm } from "@/components/admin/QuickAjandaForm";
import { AdminPlanner } from "@/components/admin/AdminPlanner";
import { AdminSection } from "@/components/admin/AdminSection";
import { AdminBentoCard } from "@/components/admin/AdminBentoCard";
import { getRecentPlannerEntriesAdmin } from "@/lib/planner-admin";

const MONTH_LABELS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export const dynamic = "force-dynamic";

export default async function AdminPlannerPage() {
  const year = new Date().getFullYear();
  const recent = await getRecentPlannerEntriesAdmin(5);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Ajanda</h1>
        <p className="mt-1 text-sm text-white/50">
          Hızlı kayıt — tarih, başlık, not.
        </p>
      </div>

      <div className="mx-auto max-w-lg">
        <QuickAjandaForm initialRecent={recent} />
      </div>

      <details className="group rounded-2xl border border-white/10 bg-white/[0.02]">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm text-white/55 transition hover:text-white/80 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between">
            Gelişmiş: ay canvas & günlük takvim
            <span className="text-white/35 group-open:hidden">▾</span>
            <span className="hidden text-white/35 group-open:inline">▴</span>
          </span>
        </summary>
        <div className="space-y-8 border-t border-white/10 px-5 py-6">
          <AdminSection
            title="Sayfa düzeni (Canvas)"
            description="Aya tıklayarak öğe yerleştir."
          >
            <AdminBentoCard colSpan={4} rowSpan={1}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {MONTH_LABELS.map((label, i) => (
                  <Link
                    key={i}
                    href={`/secretgate/planner/${year}/${i + 1}`}
                    className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-center font-medium text-white transition hover:border-amber-400/50 hover:bg-white/20"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </AdminBentoCard>
          </AdminSection>

          <AdminSection title="Günlük kayıtlar" description="Takvimden gün seç.">
            <AdminBentoCard colSpan={4} rowSpan={1} className="overflow-visible">
              <AdminPlanner />
            </AdminBentoCard>
          </AdminSection>
        </div>
      </details>
    </div>
  );
}
