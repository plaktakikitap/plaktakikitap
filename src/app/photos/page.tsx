import { Suspense } from "react";
import { getPhotosPublic } from "@/lib/photos";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import Footer from "@/components/Footer";
import SiteBackground from "@/components/SiteBackground";
import { PhotosContent } from "@/components/photos/PhotosContent";

export const dynamic = "force-dynamic";

export default async function PhotosPage() {
  let photos: Awaited<ReturnType<typeof getPhotosPublic>> = [];
  try {
    photos = await getPhotosPublic();
  } catch {
    // Supabase not configured – show empty state
  }

  return (
    <PageTransitionTarget layoutId="card-/photos">
      <main className="relative min-h-screen text-white">
        <SiteBackground />
        <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-center text-white/60">Yükleniyor…</div>}>
          <PhotosContent photos={photos} />
        </Suspense>
        <Footer />
      </main>
    </PageTransitionTarget>
  );
}
