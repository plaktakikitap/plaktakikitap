import Link from "next/link";
import { ArrowUpRight, BookMarked, Plus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getReadingGoal } from "@/lib/db/queries";
import { getBooks } from "@/lib/queries";
import { AdminReadingGoalForm } from "@/components/admin/AdminReadingGoalForm";
import { AdminReadingLogTabs } from "@/components/admin/AdminReadingLogTabs";
import { ExcelIndirButonu } from "@/components/admin/ExcelIndirButonu";

export const dynamic = "force-dynamic";

export default async function AdminReadingLogPage() {
  const allBooks = await getBooks(true);
  const toReadBooks = allBooks.filter((b) => b.status === "to_read");
  const logBooks = allBooks.filter((b) => b.status !== "to_read");
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
  const goalInitial = {
    year,
    goal: goalFromSettings,
    read_count: goalData?.read_count ?? 0,
  };

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="admin-heading flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
              <BookMarked className="h-6 w-6 text-[#b8934a]" />
              Okuma günlüğü
            </h1>
            <p className="mt-2 text-sm text-[#6b6158]">
              Kitaplar, alıntılar ve yıllık hedef. Okunacaklar kütüphanede durur; günlük /readings
              rafında yayınlanır.
            </p>
          </div>
          <Link
            href="/readings"
            target="_blank"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3 py-2 text-xs text-[#6b6158] transition-colors hover:border-[rgba(184,147,74,0.35)] hover:text-[#b8934a]"
          >
            Siteyi gör
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <div className="space-y-10">
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="admin-section-title">Kitaplar</h2>
            <div className="flex flex-wrap items-center gap-2">
              <ExcelIndirButonu tur="kitaplar" />
              <Link
                href="/secretgate/reading-log/new"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8e0d4] bg-[#faf7f2] px-3 py-2 text-xs font-medium text-[#1a1612] transition-colors hover:border-[#b8934a]/30 hover:bg-[#b8934a]/5"
              >
                <Plus className="h-3.5 w-3.5 text-[#b8934a]" />
                Yeni kitap
              </Link>
            </div>
          </div>
          <p className="mb-3 text-xs text-[#a09588]">
            {logBooks.length} günlük · {toReadBooks.length} okunacak
          </p>
          <AdminReadingLogTabs logBooks={logBooks} toReadBooks={toReadBooks} />
        </div>

        <div>
          <h2 className="admin-section-title mb-4">Yıllık hedef</h2>
          <AdminReadingGoalForm initial={goalInitial} />
        </div>
      </div>
    </div>
  );
}
