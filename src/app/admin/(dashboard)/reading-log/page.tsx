import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getReadingGoal } from "@/lib/db/queries";
import { getBooks } from "@/lib/queries";
import { Plus, Pencil } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminReadingGoalForm } from "@/components/admin/AdminReadingGoalForm";

export default async function AdminReadingLogPage() {
  const books = await getBooks(true);
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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Okuma günlüğü</h1>
          <p className="mt-1 text-[var(--muted)]">{books.length} kitap</p>
        </div>
        <Link
          href="/admin/reading-log/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Yeni kitap
        </Link>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-medium">Kitaplar</h2>
        <div className="mt-3 space-y-2">
          {books.map((book) => (
            <div
              key={book.id}
              className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-3"
            >
              <div>
                <p className="font-medium">
                  {book.title}
                  {book.is_featured_current && (
                    <span className="ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-normal text-amber-600 dark:text-amber-400">
                      Öne çıkan
                    </span>
                  )}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {book.author && `${book.author} • `}
                  {book.status} • {book.page_count} sayfa
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/reading-log/${book.id}/edit`}
                  className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                  aria-label="Düzenle"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteButton id={book.id} type="book" label={book.title} />
              </div>
            </div>
          ))}
        </div>
        {books.length === 0 && (
          <p className="py-8 text-center text-[var(--muted)]">Henüz kitap yok.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium">Yıllık hedef</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          <code>reading_goal_{year}</code> — Okuma günlüğü sayfasındaki hedef (X / Y kitap).
        </p>
        <AdminReadingGoalForm initial={goalInitial} />
      </section>
    </div>
  );
}
