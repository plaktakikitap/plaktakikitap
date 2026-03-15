import { Suspense } from "react";
import { getPhotosPublic } from "@/lib/photos";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import SiteBackground from "@/components/SiteBackground";
import { PhotosContent } from "@/components/photos/PhotosContent";
import { PhotosPageSkeleton } from "@/components/photos/PhotosPageSkeleton";

export const revalidate = 60;

export default async function PhotosPage() {
  return (
    <PageTransitionTarget layoutId="card-/photos">
      <main className="relative min-h-screen text-white">
        <SiteBackground />
        <Suspense fallback={<PhotosPageSkeleton />}>
          <PhotosPageInner />
        </Suspense>
      </main>
    </PageTransitionTarget>
  );
}

async function PhotosPageInner() {
  let photos: Awaited<ReturnType<typeof getPhotosPublic>> = [];
  try {
    photos = await getPhotosPublic();
  } catch {
    // Supabase not configured – show empty state
  }
  return <PhotosContent photos={photos} />;
}
