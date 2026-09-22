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
        <h1 className="text-2xl font-semibold text-[#1a1612]">Ajanda</h1>
        <p className="mt-1 text-sm text-[#6b6158]">
          Hızlı kayıt — tarih, başlık, not.
        </p>
      </div>

      <div className="mx-auto max-w-lg">
        <QuickAjandaForm initialRecent={recent} />
      </div>

      <details className="group rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm text-[#6b6158] transition hover:text-[#1a1612]/80 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between">
            Gelişmiş: ay canvas & günlük takvim
            <span className="text-[#1a1612]/40 group-open:hidden">▾</span>
            <span className="hidden text-[#1a1612]/40 group-open:inline">▴</span>
          </span>
        </summary>
        <div className="space-y-8 border-t border-[#e8e0d4] px-5 py-6">
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
                    className="rounded-lg border border-[#d4c9bb] bg-[#1a1612]/8 px-4 py-3 text-center font-medium text-[#1a1612] transition hover:border-[#b8934a]/50 hover:bg-[#1a1612]/8"
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
