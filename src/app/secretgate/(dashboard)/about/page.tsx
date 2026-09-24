import { BookOpen } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminAboutTimelineForm } from "@/components/admin/AdminAboutTimelineForm";

export default async function AdminAboutPage() {
  const supabase = createAdminClient();
  const { data: entries } = await supabase
    .from("about_timeline")
    .select("*")
    .order("order_index", { ascending: true });

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
          <BookOpen className="h-6 w-6 text-[#b8934a]" />
          Beni Tanıyın — Timeline
        </h1>
        <p className="mt-2 text-sm text-[#6b6158]">
          Narrative timeline paragrafları ve Polaroid görselleri
        </p>
      </header>
      <AdminAboutTimelineForm entries={entries ?? []} />
    </div>
  );
}
