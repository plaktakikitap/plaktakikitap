import { PlannerNotebook } from "@/components/planner/PlannerNotebook";
import { PageHeader } from "@/components/layout/PageHeader";

export default function PlannerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader
        layoutId="nav-/planner"
        title="Planner"
        subtitle="Daily journal & calendar"
      />
      <PlannerNotebook />
    </div>
  );
}
