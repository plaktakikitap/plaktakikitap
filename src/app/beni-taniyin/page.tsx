import { supabaseServer } from "@/lib/supabase-server";
import { AboutTimeline } from "@/components/about/AboutTimeline";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";

export type TimelineEntry = {
  id: string;
  year_or_period: string;
  paragraph_text: string;
  associated_images: { url: string; caption?: string }[];
  order_index: number;
  is_highlight: boolean;
};

export default async function BeniTaniyinPage() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("about_timeline")
    .select("*")
    .order("order_index", { ascending: true });

  const entries = (error ? [] : data ?? []) as TimelineEntry[];

  return (
    <PageTransitionTarget layoutId="card-/beni-taniyin">
      <main className="min-h-screen">
        <div className="mx-auto max-w-5xl px-4 pt-8 pb-20 sm:px-6 sm:pt-10 sm:pb-24">
          <PageHeader
            layoutId="nav-/beni-taniyin"
            title="Beni Tanıyın"
            titleClassName="text-white font-bold"
          />
          <AboutTimeline entries={entries} />
        </div>
        <Footer />
      </main>
    </PageTransitionTarget>
  );
}
