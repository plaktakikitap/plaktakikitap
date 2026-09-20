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
  const description = item.icerik.replace(/\s+/g, " ").trim().slice(0, 160);
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
    <main className="relative min-h-screen text-[#f3ead9]">
      <article className="animate-page-fade-in mx-auto max-w-[680px] px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10 text-center">
          <h1
            className="text-3xl font-medium leading-tight text-[#f3ead9] sm:text-4xl"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {item.baslik}
          </h1>
          <time
            dateTime={item.olusturma_tarihi}
            className="mt-3 block text-sm text-[#9a9488]"
          >
            {formatDate(item.olusturma_tarihi)}
          </time>
        </header>

        <div
          className="whitespace-pre-wrap text-center text-[1.05rem] leading-[1.8] text-[#e8dcc0]"
        >
          {item.icerik}
        </div>

        <p className="mt-14 text-center">
          <Link
            href={SECTION_PATH}
            className="text-sm text-[#c9a65a] no-underline hover:underline"
          >
            ← {SECTION_TITLE}
          </Link>
        </p>
        <p className="sr-only">{SECTION_NAME}</p>
      </article>
    </main>
  );
}
