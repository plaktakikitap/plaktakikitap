import { getWorksPublic } from "@/lib/works";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { WorksContent } from "@/components/works/WorksContent";

export const revalidate = 60;

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
      </main>
    </PageTransitionTarget>
  );
}
