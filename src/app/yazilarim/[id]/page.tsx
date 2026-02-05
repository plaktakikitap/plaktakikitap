import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getWritingById } from "@/lib/writings";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const writing = await getWritingById(id);
  if (!writing) return { title: "Yazı bulunamadı" };
  return { title: `${writing.title} | Yazılarım` };
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

export default async function YazıReadingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const writing = await getWritingById(id);
  if (!writing) notFound();

  return (
    <PageTransitionTarget layoutId="card-/yazilarim">
      <main className="yazilarim-paper min-h-screen">
        <article className="animate-page-fade-in mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <Link
            href="/yazilarim"
            className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted)] no-underline hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Yazılarım
          </Link>

          <header className="mb-8">
            <h1 className="font-editorial text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
              {writing.title}
            </h1>
            <time
              dateTime={writing.published_at}
              className="mt-2 block text-sm text-[var(--muted)]"
            >
              {formatDate(writing.published_at)}
            </time>
          </header>

          <div
            className="yazilarim-body font-serif text-[var(--foreground)] [&_p]:mb-4 [&_p]:leading-relaxed [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:font-editorial [&_h2]:text-xl [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-editorial [&_h3]:text-lg [&_ul]:list-inside [&_ul]:list-disc [&_ul]:space-y-1 [&_ol]:list-inside [&_ol]:list-decimal [&_ol]:space-y-1 [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--border)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--muted)] [&_a]:text-[var(--accent)] [&_a]:underline [&_a:hover]:no-underline"
            dangerouslySetInnerHTML={{ __html: writing.body }}
          />
        </article>
        <Footer />
      </main>
    </PageTransitionTarget>
  );
}
