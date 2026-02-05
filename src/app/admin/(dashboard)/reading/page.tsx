import { createAdminClient } from "@/lib/supabase/admin";
import { AdminReadingForm } from "@/components/admin/AdminReadingForm";
import Link from "next/link";

export default async function AdminReadingPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("reading_status")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const raw = data as {
    book_title?: string;
    author?: string | null;
    cover_url?: string | null;
    note?: string | null;
    status?: string;
    progress_percent?: number | null;
  } | null;
  const initial = raw
    ? {
        book_title: raw.book_title ?? "",
        author: raw.author ?? null,
        cover_url: raw.cover_url ?? null,
        note: raw.note ?? null,
        status: raw.status ?? "",
        progress_percent: raw.progress_percent ?? null,
      }
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-semibold">Şu an okuyorum</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Ana sayfa ve okuma günlüğündeki &quot;Şu an okuyorum&quot; kartı.         Yıllık hedefi{" "}
        <Link href="/admin/settings" className="text-[var(--accent)] underline hover:no-underline">
          Ayarlar
        </Link>
        &apos;dan güncelleyebilirsiniz.
      </p>
      <AdminReadingForm initial={initial} />
    </div>
  );
}
