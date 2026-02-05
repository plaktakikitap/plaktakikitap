import { getWorksPublic } from "@/lib/works";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import Footer from "@/components/Footer";
import { WorksContent } from "@/components/works/WorksContent";

export const dynamic = "force-dynamic";

export default async function WorksPage() {
  let items: Awaited<ReturnType<typeof getWorksPublic>>["items"] = [];
  let cvDownloadUrl = "";
  try {
    const data = await getWorksPublic();
    items = data.items;
    cvDownloadUrl = data.cvDownloadUrl;
  } catch {
    // Supabase not configured – show empty state
  }

  return (
    <PageTransitionTarget layoutId="card-/works">
      <main className="relative min-h-screen text-white">
        <WorksContent items={items} cvDownloadUrl={cvDownloadUrl} />
        <Footer />
      </main>
    </PageTransitionTarget>
  );
}
