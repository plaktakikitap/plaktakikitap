import { createAdminClient } from "@/lib/supabase/admin";
import { AdminWorksPanel } from "@/components/admin/AdminWorksPanel";

export default async function AdminWorksPage() {
  const supabase = createAdminClient();
  const [
    { data: videos },
    { data: art },
    { data: projects },
    { data: badges },
    { data: experiences },
    { data: settingsRow },
  ] = await Promise.all([
    supabase.from("works_videos").select("*").order("order_index", { ascending: true }),
    supabase.from("works_art").select("*").order("order_index", { ascending: true }),
    supabase.from("works_projects").select("*").order("order_index", { ascending: true }),
    supabase.from("works_badges").select("*").order("order_index", { ascending: true }),
    supabase.from("works_experiences").select("*").order("order_index", { ascending: true }),
    supabase.from("works_settings").select("value").eq("key", "cv_download_url").maybeSingle(),
  ]);

  const cvDownloadUrl = settingsRow?.value ?? "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-xl font-semibold">Yaptıklarım — Yetenek Vitrini</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        YouTube, sanat galerisi, projeler, rozetler, CV deneyimleri ve indirme linki
      </p>
      <AdminWorksPanel
        videos={videos ?? []}
        art={art ?? []}
        projects={projects ?? []}
        badges={badges ?? []}
        experiences={experiences ?? []}
        cvDownloadUrl={cvDownloadUrl}
      />
    </div>
  );
}
