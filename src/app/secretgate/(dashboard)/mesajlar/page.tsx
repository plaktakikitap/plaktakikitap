import { createAdminClient } from "@/lib/supabase/admin";
import { AdminMesajlarPanel, type SiteMessage } from "@/components/admin/AdminMesajlarPanel";

export default async function AdminMesajlarPage() {
  let messages: SiteMessage[] = [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("mesajlar")
      .select("id, isim, mesaj, tarih")
      .order("tarih", { ascending: false });

    if (!error && data) {
      messages = data as SiteMessage[];
    }
  } catch {
    messages = [];
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-semibold">Site İçi Gelen Mesajlar</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Beni Tanıyın sayfasındaki ziyaretçi mesajları
      </p>
      <AdminMesajlarPanel messages={messages} />
    </div>
  );
}
