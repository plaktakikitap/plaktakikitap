import type { Metadata } from "next";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { PageHeader } from "@/components/layout/PageHeader";
import { WatchLogChoice } from "@/components/watch-log/WatchLogChoice";
import "./animations.css";

export const metadata: Metadata = {
  title: "İzleme Günlüğüm | Plaktaki Kitap",
  description: "İzlediğim filmler ve diziler, onlara dair düşüncelerim.",
};

export default function IzlemeGunlugumPage() {
  return (
    <PageTransitionTarget layoutId="card-/izleme-gunlugum">
      <main className="relative min-h-screen text-ink">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
          <PageHeader
            layoutId="nav-/izleme-gunlugum"
            title="İzleme Günlüğüm"
            titleClassName="!text-ink font-bold"
            subtitle="filmler mi, diziler mi?"
            subtitleClassName="text-ink/70"
          />
          <WatchLogChoice />
        </div>
      </main>
    </PageTransitionTarget>
  );
}
