import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getKaralamaBySlug,
  getKaralamalarPublic,
} from "@/lib/karalamalar";
import {
  SECTION_NAME,
  SECTION_PATH,
  SECTION_TITLE,
} from "@/lib/karalamalar-section";
import SpoilerText from "@/components/SpoilerText";
import { stripSpoilers } from "@/lib/spoiler";
import { formatDateTr } from "@/lib/format-date-tr";

export const revalidate = 60;

export async function generateStaticParams() {
  const items = await getKaralamalarPublic();
  return items.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getKaralamaBySlug(slug);
  if (!item) return { title: "Bulunamadı" };
  const description = stripSpoilers(item.icerik).slice(0, 160);
  return {
    title: `${item.baslik} | ${SECTION_TITLE}`,
    description,
  };
}

export default async function KaralamaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getKaralamaBySlug(slug);
  if (!item) notFound();

  return (
    <main className="relative min-h-screen text-ink">
      <article className="animate-page-fade-in mx-auto max-w-[720px] px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href={SECTION_PATH}
          className="mb-10 inline-flex items-center gap-2 text-[0.78rem] tracking-[0.08em] text-ink-muted no-underline transition hover:text-gold"
        >
          <span aria-hidden>←</span>
          {SECTION_NAME}
        </Link>

        <time
          dateTime={item.olusturma_tarihi}
          className="mb-3 block font-editorial text-[1.05rem] tracking-[-0.01em] text-gold"
        >
          {formatDateTr(item.olusturma_tarihi).label}
        </time>
        <h1 className="karalama-title type-2 m-0 tracking-[-0.02em] text-ink">
          {item.baslik}
        </h1>

        <div className="mt-8 rounded-2xl border border-[#1a1612]/[0.08] bg-white/55 px-5 py-6 shadow-[0_12px_32px_rgba(26,22,18,0.05)] sm:px-8 sm:py-8">
          <div className="max-w-[640px] whitespace-pre-wrap text-[1.05rem] leading-[1.85] text-ink/85">
            <SpoilerText content={item.icerik} />
          </div>
        </div>
      </article>
    </main>
  );
}
