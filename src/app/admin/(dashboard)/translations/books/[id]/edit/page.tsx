import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import type { TranslationBookRow } from "@/types/database";
import { AdminTranslationBookForm } from "@/components/admin/AdminTranslationBookForm";
import Link from "next/link";

export default async function EditTranslationBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("translation_books")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();
  const book = data as TranslationBookRow;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/admin/translations"
        className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Çeviriler
      </Link>
      <h1 className="mt-4 text-xl font-semibold">Kitap düzenle</h1>
      <AdminTranslationBookForm book={book} />
    </div>
  );
}
