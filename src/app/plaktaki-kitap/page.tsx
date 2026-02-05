import { getPlaktakiKitapSettings, getPlaktakiKitapItems } from "@/lib/plaktaki-kitap";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { PlaktakiKitapContent } from "@/components/plaktaki-kitap/PlaktakiKitapContent";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function PlaktakiKitapPage() {
  const [settings, items] = await Promise.all([
    getPlaktakiKitapSettings(),
    getPlaktakiKitapItems(),
  ]);

  return (
    <PageTransitionTarget layoutId="card-/plaktaki-kitap">
      <main className="relative min-h-screen text-white">
        <PlaktakiKitapContent settings={settings} items={items} />
        <Footer />
      </main>
    </PageTransitionTarget>
  );
}
