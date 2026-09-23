import Link from "next/link";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { OkumaIstatistikleriContent } from "@/components/reading/OkumaIstatistikleriContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Okuma İstatistikleri — Plaktaki Kitap",
  description: "Okuma günlüğü yıl özeti ve istatistikler",
};

export default function OkumaIstatistikleriPage() {
  return (
    <PageTransitionTarget layoutId="card-/okuma-gunlugum/istatistikler">
      <main className="relative min-h-screen text-ink">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <header className="mb-8 sm:mb-10">
            <Link
              href="/readings"
              className="text-xs tracking-wide text-ink-muted transition-colors hover:text-gold"
            >
              ← okuma günlüğüm
            </Link>
            <h1 className="mt-4 font-editorial text-4xl font-medium tracking-tight text-ink sm:text-5xl md:text-6xl">
              okuma günlüğüm
            </h1>
            <p className="section-eyebrow mt-2">istatistikler</p>
          </header>

          <OkumaIstatistikleriContent />
        </div>
      </main>
    </PageTransitionTarget>
  );
}
