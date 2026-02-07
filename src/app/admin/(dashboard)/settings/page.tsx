import { createAdminClient } from "@/lib/supabase/admin";
import { getReadingGoal } from "@/lib/db/queries";
import { AdminReadingGoalForm } from "@/components/admin/AdminReadingGoalForm";
import { AdminSection } from "@/components/admin/AdminSection";
import { AdminBentoCard } from "@/components/admin/AdminBentoCard";

export default async function AdminSettingsPage() {
  const supabase = createAdminClient();
  const year = new Date().getFullYear();
  const key = `reading_goal_${year}`;
  const { data: row } = await supabase
    .from("settings")
    .select("value_json")
    .eq("key", key)
    .maybeSingle();

  const value = row?.value_json as { year?: number; goal?: number } | null;
  const goalFromSettings = value?.goal ?? 12;
  const goalData = await getReadingGoal(year);
  const initial = {
    year,
    goal: goalFromSettings,
    read_count: goalData?.read_count ?? 0,
  };

  return (
    <div className="space-y-12">
      <AdminSection
        title="Ayarlar"
        description="Genel ve okuma günlüğü ayarları — hedef ve istatistikler."
      >
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1 lg:max-w-2xl">
          <AdminBentoCard colSpan={1} rowSpan={1}>
            <AdminReadingGoalForm initial={initial} />
          </AdminBentoCard>
        </div>
      </AdminSection>
    </div>
  );
}
