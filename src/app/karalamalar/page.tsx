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
      <main className="relative min-h-screen text-[#f3ead9]">
        <div className="animate-page-fade-in mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
          <header className="mb-12 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#c9a65a]">
              {SECTION_NAME}
            </p>
            <p className="mt-3 text-sm text-[#9a9488]">
              Kafama esen kısa notlar
            </p>
          </header>

          <KaralamalarList items={items} />
        </div>
      </main>
    </PageTransitionTarget>
  );
}
