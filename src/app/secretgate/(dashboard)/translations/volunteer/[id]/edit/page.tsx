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
  const { data, error } = await supabase
    .from("translation_volunteer_projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) notFound();
  const project = data as TranslationVolunteerProjectRow;

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/secretgate/translations"
        className="text-sm text-[#6b6158] transition-colors hover:text-[#b8934a]"
      >
        ← Çeviriler
      </Link>
      <h1 className="admin-heading mt-4 text-2xl font-semibold text-[#1a1612]">
        Gönüllü proje düzenle
      </h1>
      <p className="mt-1 text-sm text-[#6b6158]">{project.org_name}</p>
      <AdminTranslationVolunteerForm project={project} />
    </div>
  );
}
