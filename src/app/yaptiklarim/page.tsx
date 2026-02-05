import { supabaseServer } from "@/lib/supabase-server";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import Footer from "@/components/Footer";
import { WorksYouTubeGallery } from "@/components/works/WorksYouTubeGallery";
import { WorksArtGrid } from "@/components/works/WorksArtGrid";
import { WorksProjects } from "@/components/works/WorksProjects";
import { WorksBadges } from "@/components/works/WorksBadges";
import { WorksCV } from "@/components/works/WorksCV";

export default async function YaptiklarimPage() {
  const supabase = await supabaseServer();
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

  const cvDownloadUrl = (settingsRow?.value as string) ?? "";

  return (
    <PageTransitionTarget layoutId="card-/yaptiklarim">
      <main className="min-h-screen">
        <div className="mx-auto max-w-5xl px-4 pt-8 pb-20 sm:px-6 sm:pt-10 sm:pb-24">
          <PageHeader
            layoutId="nav-/yaptiklarim"
            title="Yaptıklarım"
            titleClassName="text-white font-bold"
            subtitle="Yetenek vitrini — videolar, sanat, projeler, sertifikalar"
          />

          <WorksYouTubeGallery videos={videos ?? []} />
          <WorksArtGrid items={art ?? []} />
          <WorksProjects projects={projects ?? []} />
          <WorksBadges badges={badges ?? []} />
          <WorksCV experiences={experiences ?? []} cvDownloadUrl={cvDownloadUrl} />
        </div>
        <Footer />
      </main>
    </PageTransitionTarget>
  );
}
