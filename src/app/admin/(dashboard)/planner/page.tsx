import { getAdminPlannerEntries } from "@/lib/db/queries";
import { AdminPlanner } from "@/components/admin/AdminPlanner";

export default async function AdminPlannerPage() {
  const entries = await getAdminPlannerEntries();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 pt-20">
      <AdminPlanner entries={entries} />
    </div>
  );
}
