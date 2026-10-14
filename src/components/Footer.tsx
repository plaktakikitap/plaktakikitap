import { supabaseServer } from "@/lib/supabase-server";
import { SocialLinksSection } from "@/components/footer/SocialLinksSection";
import { FooterCopy } from "@/components/footer/FooterCopy";
import { TornPaper } from "@/components/footer/TornPaper";

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
    <footer className="footer-paper relative mt-0">
      <div className="torn-layers" aria-hidden="true">
        <TornPaper />
      </div>
      <div className="footer-content">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <FooterCopy>© 2026 Eymen — Plaktaki Kitap</FooterCopy>
          <div className="flex justify-end md:ml-auto">
            <SocialLinksSection links={links} />
          </div>
        </div>
      </div>
    </footer>
  );
}
