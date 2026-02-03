import { Suspense } from "react";
import { HomePageContent } from "@/components/home/HomePageContent";
import { EntrySeedHandler } from "@/components/home/EntrySeedHandler";
import NowPanel from "@/components/NowPanel";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <EntrySeedHandler />
      </Suspense>

      {/* hero + kart grid + ajanda */}
      <HomePageContent>
        <NowPanel />
      </HomePageContent>

      <Footer />
    </>
  );
}
