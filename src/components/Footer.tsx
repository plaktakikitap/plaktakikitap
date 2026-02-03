import { supabaseServer } from "@/lib/supabase-server";
import { SocialLinksSection } from "@/components/footer/SocialLinksSection";

export default async function Footer() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("social_links")
    .select("id, platform, url, icon_name, is_active, order_index")
    .order("order_index", { ascending: true });

  const links = (error ? [] : data ?? []) as {
    id: string;
    platform: string;
    url: string;
    icon_name: string | null;
    is_active: boolean;
    order_index: number;
  }[];

  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-white/50">
          © 2026 Eymen — Plaktaki Kitap
        </div>
        <SocialLinksSection links={links} />
      </div>
    </footer>
  );
}
