"use client";

import ChoiceCard from "./ChoiceCard";
import { IntroGateBackground } from "./IntroGateBackground";

export function IntroGate() {
  return (
    <>
      <IntroGateBackground />

      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16 text-[#F3EBDD]">
        {/* Center-top text */}
        <h2
          className="mb-12 text-center font-display text-2xl font-medium tracking-tight sm:mb-16 sm:text-3xl md:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
          lang="en"
        >
          MAKE YOUR CHOICE
        </h2>

        {/* Two choices - side by side on desktop, stacked on mobile */}
        <div className="flex w-full max-w-3xl flex-col items-center gap-8 md:flex-row md:justify-center md:gap-12">
          <ChoiceCard
            href="/home?entry=plak"
            src="/images/intro/plak_hand.png"
            alt="Plak uzatan el"
            label="Plak"
            glow="red"
          />
          <ChoiceCard
            href="/home?entry=kitap"
            src="/images/intro/kitap_hand.png"
            alt="Kitap uzatan el"
            label="Kitap"
            glow="blue"
          />
        </div>
      </main>
    </>
  );
}
