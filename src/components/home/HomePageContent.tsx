"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { IntroCards } from "@/components/home/IntroCards";
import { KaralamalarHomeSection } from "@/components/karalamalar/KaralamalarHomeSection";
import { LazyAjanda } from "@/components/home/LazyAjanda";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Video } from "@/types/videos";
import type { Karalama } from "@/lib/karalamalar";

const VinylScrollStage = dynamic(
  () =>
    import("@/components/home/VinylScrollStage").then((m) => m.VinylScrollStage),
  { ssr: false }
);

const HeroSection = dynamic(() => import("@/components/HeroSection"), {
  ssr: false,
});

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
  const isMd = useMediaQuery("(min-width: 768px)");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const title = (introTitle ?? "hoş geldiniz, ben eymen").toLocaleLowerCase(
    "tr-TR"
  );
  const subtitle = (
    introSubtitle ?? "nam-ı diğer plaktaki kitap"
  ).toLocaleLowerCase("tr-TR");

  return (
    <main
      className="vinyl-page-bg relative min-h-screen overflow-clip text-ink"
      style={{ minHeight: "100vh", position: "relative" }}
    >
      {!hydrated ? (
        <div className="min-h-screen" aria-hidden />
      ) : isMd ? (
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
      ) : (
        <div>
          <HeroSection
            photoSrc={introPhotoEymenUrl ?? "/images/eymen-studio.jpg"}
            logoSrc={introPhotoPlaktakikitapUrl ?? "/images/logo.png"}
            title={introTitle ?? undefined}
            subtitle={introSubtitle ?? undefined}
          />

          <div className="mx-auto mt-4 w-full max-w-6xl px-2 sm:mt-6 sm:px-6">
            <p className="section-eyebrow mb-6 text-center">keşfet</p>
            <IntroCards
              latestVideo={latestVideo}
              latestVideoThumb={latestVideoThumb}
            />
          </div>

          <div className="py-8">
            <hr className="section-divider" aria-hidden />
          </div>

          <section className="section-block px-4">
            <p className="section-eyebrow mb-8 text-center">ajanda</p>
            <LazyAjanda />
          </section>

          <div className="py-8">
            <hr className="section-divider" aria-hidden />
          </div>

          <KaralamalarHomeSection items={karalamalarPreview} />
          <div className="mx-auto max-w-6xl px-4 pb-8">{children}</div>
        </div>
      )}
    </main>
  );
}
