import { createAdminClient } from "@/lib/supabase/admin";
import { getReadingGoal } from "@/lib/db/queries";
import { AdminReadingGoalForm } from "@/components/admin/AdminReadingGoalForm";

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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-semibold">Ayarlar</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Genel ve okuma günlüğü ayarları
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Yıllık okuma hedefi</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Okuma günlüğü sayfasındaki &quot;X / Y kitap&quot; ve dairesel ilerleme çubuğu bu değerlerle güncellenir. Hedef ve okunan sayısını manuel girebilirsiniz.
        </p>
        <AdminReadingGoalForm initial={initial} />
      </section>
    </div>
  );
}
