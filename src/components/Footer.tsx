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
    <footer className="!relative !mt-16 !overflow-hidden">
      {/* Üst sınır — soldan sağa sönümlenen ince altın çizgi */}
      <div
        className="!absolute !left-0 !right-0 !top-0 !h-px !w-full"
        style={{
          background: "linear-gradient(90deg, rgba(212,175,55,0.6) 0%, rgba(212,175,55,0.2) 50%, transparent 100%)",
        }}
        aria-hidden
      />

      <div className="!mx-auto !flex !max-w-6xl !flex-col !gap-4 !px-4 !py-5 !sm:px-6 !md:flex-row !md:items-end !md:justify-between">
        <div className="!text-[11px] !font-light !tracking-[0.2em] !text-white/50 sm:!text-xs sm:!tracking-[0.25em]">
          © 2026 Eymen — Plaktaki Kitap
        </div>
        <div className="!flex !justify-end !md:ml-auto">
          <SocialLinksSection links={links} />
        </div>
      </div>
    </footer>
  );
}
