import { getVideosPublic } from "@/lib/videos";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import Footer from "@/components/Footer";
import { VideosContent } from "@/components/videos/VideosContent";

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  let videos: Awaited<ReturnType<typeof getVideosPublic>> = [];
  try {
    videos = await getVideosPublic();
  } catch {
    // Supabase not configured – show empty state
  }

  return (
    <PageTransitionTarget layoutId="card-/videos">
      <main className="relative min-h-screen text-white">
        <VideosContent videos={videos} />
        <Footer />
      </main>
    </PageTransitionTarget>
  );
}
