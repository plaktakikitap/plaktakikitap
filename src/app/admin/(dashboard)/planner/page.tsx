import { AdminPlanner } from "@/components/admin/AdminPlanner";
import { AdminSection } from "@/components/admin/AdminSection";
import { AdminBentoCard } from "@/components/admin/AdminBentoCard";

export default function AdminPlannerPage() {
  return (
    <div className="space-y-8">
      <AdminSection
        title="Ajanda"
        description="Bullet journal — sayfa düzeni, notlar, Polaroid ve overlay öğeleri."
      >
        <AdminBentoCard colSpan={4} rowSpan={1} className="overflow-visible">
          <AdminPlanner />
        </AdminBentoCard>
      </AdminSection>
    </div>
  );
}
