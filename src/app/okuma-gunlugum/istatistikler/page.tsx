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
      <main className="relative min-h-screen text-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <header className="mb-8 sm:mb-10">
            <Link
              href="/readings"
              className="text-xs tracking-wide text-[#9a9488] transition-colors hover:text-[#c9a65a]"
            >
              ← okuma günlüğüm
            </Link>
            <h1
              className="mt-4 font-editorial text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl"
              style={{ color: "#f3ead9" }}
            >
              okuma günlüğüm
            </h1>
            <p
              className="mt-2 text-sm uppercase tracking-[0.2em]"
              style={{ color: "#9a9488" }}
            >
              istatistikler
            </p>
          </header>

          <OkumaIstatistikleriContent />
        </div>
      </main>
    </PageTransitionTarget>
  );
}
