"use client";

import { useEffect, useState } from "react";
import FramedCrossfade from "@/components/home/FramedCrossfade";
import { HomeHeroBackground } from "@/components/home/HomeHeroBackground";
import { IntroCards } from "@/components/home/IntroCards";
import { ScrollIndicator } from "@/components/home/ScrollHint";
import { getStoredEntry } from "@/components/home/EntrySeedHandler";

export function HomePageContent() {
  const [entry, setEntry] = useState<"plak" | "kitap" | null>(null);

  useEffect(() => {
    setEntry(getStoredEntry());
  }, []);

  return (
    <>
      <HomeHeroBackground entrySeed={entry} />

      <main className="relative min-h-screen text-[#F3EBDD]">
        {/* Hero - tall so users must scroll */}
        <section className="flex min-h-[140vh] flex-col items-center justify-start px-6 pt-14 pb-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center">
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

            {/* Başlıklar + scroll göstergeleri yatay hizada */}
            <div className="mt-12 flex w-full max-w-6xl items-center px-4">
              <div className="flex flex-1 justify-start">
                <ScrollIndicator />
              </div>
              <h1
                className="home-hero-h1 shrink-0 px-16 text-center font-display text-[44px] font-medium leading-[1.05] tracking-[-0.02em] text-[#F3EBDD] sm:text-[52px] md:text-[72px] lg:text-[80px]"
              >
                Hoş geldiniz, ben Eymen!
              </h1>
              <div className="flex flex-1 justify-end">
                <ScrollIndicator />
              </div>
            </div>
            <p className="mt-5 text-center font-sans text-sm font-normal tracking-[0.02em] text-[#F3EBDD]/85 sm:text-base">
              yanii... nam-ı diğer Plaktaki Kitap
            </p>

            {/* Soft cards - hemen altında */}
            <IntroCards />
          </div>
        </section>

        {/* Bottom spacing so last buttons aren't cramped */}
        <div className="h-24" />
      </main>
    </>
  );
}
