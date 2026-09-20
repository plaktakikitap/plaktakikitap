"use client";

import HeroSection from "@/components/HeroSection";
import { IntroCards } from "@/components/home/IntroCards";
import MessyBulletJournal from "@/components/planner/MessyBulletJournal";
import type { Video } from "@/types/videos";

interface HomePageContentProps {
  children?: React.ReactNode;
  latestVideo?: Video | null;
  latestVideoThumb?: string | null;
  introTitle?: string | null;
  introSubtitle?: string | null;
  introPhotoEymenUrl?: string | null;
  introPhotoPlaktakikitapUrl?: string | null;
}

export function HomePageContent({
  children,
  latestVideo,
  latestVideoThumb,
  introTitle = "Hoş geldiniz, ben Eymen!",
  introSubtitle = "yanii... nam-ı diğer Plaktaki Kitap",
  introPhotoEymenUrl = "/images/eymen-studio.jpg",
  introPhotoPlaktakikitapUrl = "/images/logo.png",
}: HomePageContentProps) {
  return (
    <>
      <main className="relative min-h-screen text-[#F3EBDD]">
        <HeroSection
          photoSrc={introPhotoEymenUrl ?? "/images/eymen-studio.jpg"}
          logoSrc={introPhotoPlaktakikitapUrl ?? "/images/logo.png"}
          title={introTitle ?? undefined}
          subtitle={introSubtitle ?? undefined}
        />

        <div className="mx-auto mt-4 w-full max-w-6xl px-2 sm:mt-6 sm:px-6">
          <IntroCards
            latestVideo={latestVideo}
            latestVideoThumb={latestVideoThumb}
          />
        </div>

        {/* Bullet journal — messy ajanda (flip + modal + previews) */}
        <section id="ajanda" className="scroll-mt-6">
          <MessyBulletJournal />
        </section>

        {/* Şu an paneli — Spotify + Okuyorum */}
        {children}

        {/* Bottom spacing */}
        <div className="h-24" />
      </main>
    </>
  );
}
