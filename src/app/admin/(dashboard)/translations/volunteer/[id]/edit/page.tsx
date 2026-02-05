import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import type { TranslationVolunteerProjectRow } from "@/types/database";
import { AdminTranslationVolunteerForm } from "@/components/admin/AdminTranslationVolunteerForm";
import Link from "next/link";

export default async function EditTranslationVolunteerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("translation_volunteer_projects").select("*").eq("id", id).maybeSingle();
  if (error || !data) notFound();
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/admin/translations" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">← Çeviriler</Link>
      <h1 className="mt-4 text-xl font-semibold">Gönüllü proje düzenle</h1>
      <AdminTranslationVolunteerForm project={data as TranslationVolunteerProjectRow} />
    </div>
  );
}
