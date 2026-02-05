import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getWritingsPublic } from "@/lib/writings";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { PageHeader } from "@/components/layout/PageHeader";
import Footer from "@/components/Footer";
import type { WritingCategory } from "@/lib/writings";
import type { Writing } from "@/lib/writings";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<WritingCategory, string> = {
  denemeler: "Denemeler",
  siirler: "Şiirler",
  diger: "Diğer",
};

const CATEGORY_ORDER: WritingCategory[] = ["denemeler", "siirler", "diger"];

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

function isTefrika(w: Writing): boolean {
  return Boolean(w.tefrika_issue?.trim());
}

export default async function YazilarimPage() {
  const writings = await getWritingsPublic();
  const digerItems = writings.filter((w) => w.category === "diger");
  const digerNormal = digerItems.filter((w) => !isTefrika(w));
  const tefrikaItems = digerItems.filter(isTefrika);

  const sections: { category: WritingCategory; label: string; items: Writing[]; isTefrikaSection?: boolean }[] = [
    { category: "denemeler", label: CATEGORY_LABELS.denemeler, items: writings.filter((w) => w.category === "denemeler") },
    { category: "siirler", label: CATEGORY_LABELS.siirler, items: writings.filter((w) => w.category === "siirler") },
    { category: "diger", label: CATEGORY_LABELS.diger, items: digerNormal },
  ];

  return (
    <PageTransitionTarget layoutId="card-/yazilarim">
      <main className="yazilarim-paper min-h-screen">
        <div className="animate-page-fade-in mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <PageHeader
            layoutId="nav-/yazilarim"
            title="Yazılarım"
            subtitle="Denemeler, şiirler ve diğer metinler"
          />

          <div className="space-y-12">
            {sections.map(({ category, label, items }) => (
              <section key={category}>
                <h2 className="mb-4 border-b border-[var(--border)] pb-2 font-editorial text-lg font-medium text-[var(--foreground)]">
                  {label}
                </h2>
                {items.length === 0 && category !== "diger" ? (
                  <p className="text-sm text-[var(--muted)]">Henüz yazı yok.</p>
                ) : (
                  <ul className="space-y-1">
                    {items.map((w) => (
                      <li key={w.id}>
                        <Link
                          href={`/yazilarim/${w.id}`}
                          className="flex flex-wrap items-baseline justify-between gap-2 py-2 text-[var(--foreground)] no-underline hover:text-[var(--accent)] hover:underline"
                        >
                          <span className="font-medium">{w.title}</span>
                          <time dateTime={w.published_at} className="text-sm text-[var(--muted)]">
                            {formatDate(w.published_at)}
                          </time>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {category === "diger" && (
                  <>
                    {digerNormal.length === 0 && tefrikaItems.length === 0 && (
                      <p className="text-sm text-[var(--muted)]">Henüz yazı yok.</p>
                    )}
                    {tefrikaItems.length > 0 && (
                      <div className="mt-8">
                        <h3 className="mb-4 border-b border-[var(--border)] pb-2 font-editorial text-base font-medium text-[var(--foreground)]">
                          Tefrika Dergisi&apos;nde Yayınlananlar
                        </h3>
                        <ul className="space-y-4">
                          {tefrikaItems.map((w) => (
                            <li
                              key={w.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--secondary)]/30 px-4 py-3"
                            >
                              <p className="min-w-0 flex-1 font-medium text-[var(--foreground)]">
                                {w.tefrika_issue}. Sayı İçin Yazdığım Yazı: {w.title}
                              </p>
                              {w.external_url ? (
                                <a
                                  href={w.external_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                                >
                                  <ExternalLink className="h-4 w-4" aria-hidden />
                                  Dergiyi Satın Al
                                </a>
                              ) : (
                                <span className="text-sm text-[var(--muted)]">Link eklenmemiş</span>
                              )}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-6 text-center">
                          <Link
                            href="/translations"
                            className="inline-flex items-center gap-2 font-medium text-[var(--accent)] no-underline hover:underline"
                          >
                            Çevirilerim için tıklayınız
                          </Link>
                        </p>
                      </div>
                    )}
                  </>
                )}
              </section>
            ))}
          </div>
        </div>
        <Footer />
      </main>
    </PageTransitionTarget>
  );
}
