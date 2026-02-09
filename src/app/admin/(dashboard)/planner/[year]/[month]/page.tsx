import { AdminPlannerCanvasEditor } from "@/components/admin/AdminPlannerCanvasEditor";
import { requireAdminOrRedirect } from "@/lib/admin-auth";

const MONTH_LABELS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export default async function AdminPlannerMonthPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);

  if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-700">
        Geçersiz yıl/ay.
      </div>
    );
  }

  const monthName = MONTH_LABELS[m - 1];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">
        Ajanda — {monthName} {y}
      </h1>
      <AdminPlannerCanvasEditor year={y} month={m} monthName={monthName} />
    </div>
  );
}
