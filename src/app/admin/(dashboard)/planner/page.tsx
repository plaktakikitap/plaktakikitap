import Link from "next/link";
import { AdminPlanner } from "@/components/admin/AdminPlanner";
import { AdminSection } from "@/components/admin/AdminSection";
import { AdminBentoCard } from "@/components/admin/AdminBentoCard";

const MONTH_LABELS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export default function AdminPlannerPage() {
  const year = new Date().getFullYear();

  return (
    <div className="space-y-8">
      <AdminSection
        title="Ajanda — Sayfa düzeni (Canvas)"
        description="Aya tıklayarak sayfa üzerinde öğe yerleştir (sürükle, döndür, ölçekle)."
      >
        <AdminBentoCard colSpan={4} rowSpan={1}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {MONTH_LABELS.map((label, i) => (
              <Link
                key={i}
                href={`/admin/planner/${year}/${i + 1}`}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-center font-medium transition hover:bg-[var(--background)] hover:border-[var(--accent)]"
              >
                {label}
              </Link>
            ))}
          </div>
        </AdminBentoCard>
      </AdminSection>

      <AdminSection
        title="Günlük kayıtlar"
        description="Takvimden gün seç, o güne entry ekle."
      >
        <AdminBentoCard colSpan={4} rowSpan={1} className="overflow-visible">
          <AdminPlanner />
        </AdminBentoCard>
      </AdminSection>
    </div>
  );
}
