import Link from "next/link";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { PageHeader } from "@/components/layout/PageHeader";
import Footer from "@/components/Footer";
import { Film, Tv } from "lucide-react";

export const dynamic = "force-dynamic";

export default function IzlemeGunlugumSelectionPage() {
  return (
    <PageTransitionTarget layoutId="card-/izleme-gunlugum">
      <main className="relative min-h-screen text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          <PageHeader
            layoutId="nav-/izleme-gunlugum"
            title="İzleme Günlüğüm"
            titleClassName="!text-white font-bold"
            subtitle="izlediğim diziler, filmler ve onlara olan yorumlarım"
            subtitleClassName="text-white/70"
          />

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
            <Link
              href="/izleme-gunlugum/filmler"
              className="group flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-white/15 hover:shadow-[0_24px_80px_rgba(0,0,0,0.35),0_0_32px_rgba(251,191,36,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e14] sm:min-h-[260px]"
            >
              <Film
                className="mb-4 h-14 w-14 text-amber-400/90 transition-colors group-hover:text-amber-300 sm:h-16 sm:w-16"
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="font-editorial text-2xl font-medium text-white sm:text-3xl">
                Filmler
              </span>
              <span className="mt-2 text-sm text-white/60">
                Film koleksiyonum ve yorumlarım
              </span>
            </Link>

            <Link
              href="/izleme-gunlugum/diziler"
              className="group flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-white/15 hover:shadow-[0_24px_80px_rgba(0,0,0,0.35),0_0_32px_rgba(251,191,36,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e14] sm:min-h-[260px]"
            >
              <Tv
                className="mb-4 h-14 w-14 text-amber-400/90 transition-colors group-hover:text-amber-300 sm:h-16 sm:w-16"
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="font-editorial text-2xl font-medium text-white sm:text-3xl">
                Diziler
              </span>
              <span className="mt-2 text-sm text-white/60">
                Dizi koleksiyonum ve yorumlarım
              </span>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    </PageTransitionTarget>
  );
}
