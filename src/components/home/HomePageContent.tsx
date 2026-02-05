"use client";

import FramedCrossfade from "@/components/home/FramedCrossfade";
import { IntroCards } from "@/components/home/IntroCards";
import { ScrollIndicator } from "@/components/home/ScrollHint";
import PlannerFlipbook from "@/components/PlannerFlipbook";

interface HomePageContentProps {
  children?: React.ReactNode;
}

export function HomePageContent({ children }: HomePageContentProps) {
  return (
    <>
      <main className="relative min-h-screen text-[#F3EBDD]">
        {/* Hero — mobilde daha kısa, masaüstünde uzun */}
        <section className="flex min-h-[100vh] flex-col items-center justify-start px-4 pt-10 pb-6 sm:min-h-[120vh] sm:px-6 sm:pt-14 sm:pb-8 md:min-h-[140vh]">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
            <div className="w-full max-w-[280px] sm:max-w-[320px]">
              <FramedCrossfade
                aSrc="/images/eymen.jpeg"
                bSrc="/images/plaktakikitap.jpeg"
                size={320}
                variant="antiqueGold"
                intervalMs={4200}
                fadeMs={1600}
                altA="Eymen portre"
                altB="Plaktaki Kitap logo"
              />
            </div>

            {/* Başlık — mobilde tek sütun, masaüstünde scroll göstergeleri yanında */}
            <div className="mt-8 flex w-full max-w-6xl flex-col items-center sm:mt-12 sm:flex-row sm:items-center sm:px-4">
              <div className="hidden flex-1 justify-start sm:flex">
                <ScrollIndicator />
              </div>
              <h1
                className="home-hero-h1 shrink-0 px-2 text-center font-display text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-[#F3EBDD] min-[400px]:text-[34px] sm:px-8 sm:text-[52px] md:text-[72px] lg:text-[80px]"
              >
                Hoş geldiniz, ben Eymen!
              </h1>
              <div className="hidden flex-1 justify-end sm:flex">
                <ScrollIndicator />
              </div>
            </div>
            <p className="mt-3 text-center font-sans text-xs font-normal tracking-[0.02em] text-[#F3EBDD]/85 sm:mt-5 sm:text-sm md:text-base">
              yanii... nam-ı diğer Plaktaki Kitap
            </p>

            {/* Kart grid */}
            <div className="mx-auto mt-8 w-full max-w-6xl px-2 pt-6 sm:mt-12 sm:px-6 sm:pt-10">
              <IntroCards />
            </div>
          </div>
        </section>

        {/* Bullet journal flipbook ajanda */}
        <PlannerFlipbook />

        {/* Şu an paneli — Spotify + Okuyorum */}
        {children}

        {/* Bottom spacing */}
        <div className="h-24" />
      </main>
    </>
  );
}
