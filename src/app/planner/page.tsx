import MessyBulletJournal from "@/components/planner/MessyBulletJournal";
import { PageHeader } from "@/components/layout/PageHeader";

export default function PlannerPage() {
  return (
    <div className="mx-auto max-w-5xl px-3 py-8 sm:px-4 sm:py-10">
      <PageHeader
        layoutId="nav-/planner"
        title="Bullet Journal"
        subtitle="Hyper-realistic & messy ajanda"
      />
      <MessyBulletJournal />
    </div>
  );
}
