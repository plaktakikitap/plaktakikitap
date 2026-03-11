import { createAdminClient } from "@/lib/supabase/admin";
import { getReadingGoal } from "@/lib/db/queries";
import { AdminSettingsControlCenter } from "@/components/admin/AdminSettingsControlCenter";
import { AdminReadingGoalForm } from "@/components/admin/AdminReadingGoalForm";
import { AdminSection } from "@/components/admin/AdminSection";
import { AdminBentoCard } from "@/components/admin/AdminBentoCard";
import { Settings } from "lucide-react";

export default async function AdminSettingsPage() {
  const year = new Date().getFullYear();
  let initial = { year, goal: 12, read_count: 0 };

  try {
    const supabase = createAdminClient();
    const key = `reading_goal_${year}`;
    const { data: row } = await supabase
      .from("settings")
      .select("value_json")
      .eq("key", key)
      .maybeSingle();

    const value = row?.value_json as { year?: number; goal?: number } | null;
    const goalFromSettings = value?.goal ?? 12;
    const goalData = await getReadingGoal(year);
    initial = {
      year,
      goal: goalFromSettings,
      read_count: goalData?.read_count ?? 0,
    };
  } catch {
    // Supabase env missing or DB error — still show control center; reading goal will use defaults
  }

  return (
    <div className="space-y-12">
      <header>
        <h1 className="admin-heading flex items-center gap-3 text-2xl font-semibold tracking-tight text-white/95">
          <Settings className="h-7 w-7 text-amber-400" />
          Kontrol Merkezi
        </h1>
        <p className="mt-1 text-sm text-white/60">
          SEO, global ayarlar, bakım modu, ana sayfa metinleri ve kaydetme — tek yerden yönetim.
        </p>
      </header>

      <AdminSettingsControlCenter />

      <AdminSection
        title="Okuma günlüğü hedefi"
        description="Bu yıl için kitap okuma hedefi (isteğe bağlı)."
      >
        <div className="max-w-2xl">
          <AdminBentoCard colSpan={1} rowSpan={1}>
            <AdminReadingGoalForm initial={initial} />
          </AdminBentoCard>
        </div>
      </AdminSection>
    </div>
  );
}
