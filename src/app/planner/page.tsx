import MessyBulletJournal from "@/components/planner/MessyBulletJournal";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import Footer from "@/components/Footer";

export default function PlannerPage() {
  return (
    <PageTransitionTarget layoutId="card-/planner">
      <main className="min-h-screen bg-[var(--background)]">
        <div className="animate-page-fade-in mx-auto max-w-5xl px-3 py-8 sm:px-4 sm:py-10">
          <PageHeader
            layoutId="nav-/planner"
            title="Bullet Journal"
            subtitle="Hyper-realistic & messy ajanda — sayfaları çevir, günlere tıkla"
          />
          <MessyBulletJournal />
        </div>
        <Footer />
      </main>
    </PageTransitionTarget>
  );
}
