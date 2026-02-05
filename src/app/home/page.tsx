import { Suspense } from "react";
import { getLatestVideo, getVideoThumbnail } from "@/lib/videos";
import type { Video } from "@/types/videos";
import { HomePageContent } from "@/components/home/HomePageContent";
import { EntrySeedHandler } from "@/components/home/EntrySeedHandler";
import NowPanel from "@/components/NowPanel";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let latestVideo: Video | null = null;
  let latestVideoThumb: string | null = null;
  try {
    latestVideo = await getLatestVideo();
    latestVideoThumb = latestVideo ? getVideoThumbnail(latestVideo) : null;
  } catch {
    // Supabase not configured or invalid URL – show default Videolar card
  }

  return (
    <>
      <Suspense fallback={null}>
        <EntrySeedHandler />
      </Suspense>

      {/* hero + kart grid + ajanda */}
      <HomePageContent
        latestVideo={latestVideo}
        latestVideoThumb={latestVideoThumb}
      >
        <NowPanel />
      </HomePageContent>

      <Footer />
    </>
  );
}
