import { Suspense } from "react";
import { getLatestVideo, getVideoThumbnail } from "@/lib/videos";
import { getSiteSettings } from "@/lib/site-settings";
import type { Video } from "@/types/videos";
import { HomePageContent } from "@/components/home/HomePageContent";
import { EntrySeedHandler } from "@/components/home/EntrySeedHandler";
import NowPanel from "@/components/NowPanel";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let latestVideo: Video | null = null;
  let latestVideoThumb: string | null = null;
  let siteSettings: Awaited<ReturnType<typeof getSiteSettings>> | null = null;
  try {
    [latestVideo, siteSettings] = await Promise.all([
      getLatestVideo().then((v) => v ?? null),
      getSiteSettings(),
    ]);
    latestVideoThumb = latestVideo ? getVideoThumbnail(latestVideo) : null;
  } catch {
    // Supabase not configured – use defaults
  }

  return (
    <>
      <Suspense fallback={null}>
        <EntrySeedHandler />
      </Suspense>

      <HomePageContent
        latestVideo={latestVideo}
        latestVideoThumb={latestVideoThumb}
        introTitle={siteSettings?.intro_title}
        introSubtitle={siteSettings?.intro_subtitle}
        introPhotoEymenUrl={siteSettings?.intro_photo_eymen_url}
        introPhotoPlaktakikitapUrl={siteSettings?.intro_photo_plaktakikitap_url}
      >
        <NowPanel />
      </HomePageContent>

      <Footer />
    </>
  );
}
