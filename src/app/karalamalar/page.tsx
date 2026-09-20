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
      <main className="relative min-h-screen text-ink">
        <div className="animate-page-fade-in mx-auto max-w-[720px] px-4 py-12 sm:px-6 sm:py-16">
          <p className="mb-10 text-[0.7rem] font-medium lowercase tracking-[0.15em] text-ink-muted">
            {SECTION_NAME}
          </p>
          <KaralamalarList items={items} />
        </div>
      </main>
    </PageTransitionTarget>
  );
}
