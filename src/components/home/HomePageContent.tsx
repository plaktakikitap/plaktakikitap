"use client";

import HeroSection from "@/components/HeroSection";
import { IntroCards } from "@/components/home/IntroCards";
import { VinylScrollStage } from "@/components/home/VinylScrollStage";
import MessyBulletJournal from "@/components/planner/MessyBulletJournal";
import { KaralamalarHomeSection } from "@/components/karalamalar/KaralamalarHomeSection";
import type { Video } from "@/types/videos";
import type { Karalama } from "@/lib/karalamalar";

interface HomePageContentProps {
  children?: React.ReactNode;
  latestVideo?: Video | null;
  latestVideoThumb?: string | null;
  introTitle?: string | null;
  introSubtitle?: string | null;
  introPhotoEymenUrl?: string | null;
  introPhotoPlaktakikitapUrl?: string | null;
  karalamalarPreview?: Karalama[];
}

export function HomePageContent({
  children,
  latestVideo,
  latestVideoThumb,
  introTitle = "Hoş geldiniz, ben Eymen!",
  introSubtitle = "yanii... nam-ı diğer Plaktaki Kitap",
  introPhotoEymenUrl = "/images/eymen-studio.jpg",
  introPhotoPlaktakikitapUrl = "/images/logo.png",
  karalamalarPreview = [],
}: HomePageContentProps) {
  const title = (introTitle ?? "hoş geldiniz, ben eymen").toLocaleLowerCase(
    "tr-TR"
  );
  const subtitle = (
    introSubtitle ?? "nam-ı diğer plaktaki kitap"
  ).toLocaleLowerCase("tr-TR");

  return (
    <>
      <main
        className="vinyl-page-bg relative min-h-screen text-[#F3EBDD]"
        style={{
          minHeight: "100vh",
          position: "relative",
        }}
      >
        {/* Masaüstü: scroll ile plak → içerik */}
        <VinylScrollStage
          title={title}
          subtitle={subtitle}
          logoSrc={introPhotoPlaktakikitapUrl ?? "/images/logo.png"}
          latestVideo={latestVideo}
          latestVideoThumb={latestVideoThumb}
          karalamalarPreview={karalamalarPreview}
        >
          {children}
        </VinylScrollStage>

        {/* Mobil: mevcut hero + kartlar */}
        <div className="md:hidden">
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

          <KaralamalarHomeSection items={karalamalarPreview} />

          <section id="ajanda" className="scroll-mt-6">
            <MessyBulletJournal />
          </section>

          {children}
        </div>

        <div className="h-24 md:hidden" />
      </main>
    </>
  );
}
