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

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
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
          className="mb-10 inline-block text-[0.78rem] tracking-[0.08em] text-ink-muted no-underline transition hover:text-gold"
        >
          ← {SECTION_NAME}
        </Link>

        <h1
          className="m-0 mb-3 text-[1.15rem] font-semibold tracking-[-0.01em] text-ink sm:text-[1.35rem]"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          {item.baslik}
        </h1>

        <div className="max-w-[680px] whitespace-pre-wrap text-[0.95rem] leading-[1.75] text-ink/80">
          <SpoilerText content={item.icerik} />
        </div>

        <time
          dateTime={item.olusturma_tarihi}
          className="mt-3 block text-[0.78rem] tracking-[0.03em] text-ink-muted"
        >
          {formatDate(item.olusturma_tarihi)}
        </time>
      </article>
    </main>
  );
}
