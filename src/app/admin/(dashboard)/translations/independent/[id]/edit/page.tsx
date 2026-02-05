import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import type { TranslationIndependentRow } from "@/types/database";
import { AdminTranslationIndependentForm } from "@/components/admin/AdminTranslationIndependentForm";
import Link from "next/link";

export default async function EditTranslationIndependentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("translation_independent").select("*").eq("id", id).maybeSingle();
  if (error || !data) notFound();
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/admin/translations" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
        ← Çeviriler
      </Link>
      <h1 className="mt-4 text-xl font-semibold">Bağımsız çeviri düzenle</h1>
      <AdminTranslationIndependentForm item={data as TranslationIndependentRow} />
    </div>
  );
}
