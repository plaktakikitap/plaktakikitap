import type { Metadata } from "next";
import { getKaralamalarPublic } from "@/lib/karalamalar";
import {
  SECTION_NAME,
  SECTION_PATH,
  SECTION_TITLE,
} from "@/lib/karalamalar-section";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { KaralamalarList } from "@/components/karalamalar/KaralamalarList";

export const revalidate = 60;

export const metadata: Metadata = {
  title: `${SECTION_TITLE} | Plaktaki Kitap`,
  description: `Kişisel ${SECTION_NAME} — kısa notlar ve düşünceler`,
};

export default async function KaralamalarPage() {
  const items = await getKaralamalarPublic();

  return (
    <PageTransitionTarget layoutId={`card-${SECTION_PATH}`}>
      <main className="relative min-h-screen overflow-x-clip text-ink">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(184,147,74,0.18),transparent_68%)]"
        />
        <div className="animate-page-fade-in relative mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16">
          <header className="mb-12 flex items-end justify-between gap-6 sm:mb-14">
            <div>
              <p className="section-eyebrow mb-3">{SECTION_NAME}</p>
              <h1 className="type-2 m-0 font-editorial font-medium tracking-[-0.02em] text-ink">
                {SECTION_TITLE}
              </h1>
              <p className="mt-2 max-w-md text-[1rem] leading-[1.6] text-ink-muted">
                Kısa notlar ve düşünceler
              </p>
            </div>
            {items.length > 0 ? (
              <p className="type-4 mb-1 shrink-0 tracking-[0.08em] text-gold">
                {items.length} karalama
              </p>
            ) : null}
          </header>
          <KaralamalarList items={items} />
        </div>
      </main>
    </PageTransitionTarget>
  );
}
