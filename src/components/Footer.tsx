import { supabaseServer } from "@/lib/supabase-server";
import { SocialLinksSection } from "@/components/footer/SocialLinksSection";
import { FooterCopy } from "@/components/footer/FooterCopy";

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
    <footer className="relative bg-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between md:py-5">
        <FooterCopy>© 2026 Eymen — Plaktaki Kitap</FooterCopy>
        <div className="flex justify-end md:ml-auto">
          <SocialLinksSection links={links} />
        </div>
      </div>
    </footer>
  );
}
