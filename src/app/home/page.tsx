import { Suspense } from "react";
import { HomePageContent } from "@/components/home/HomePageContent";
import { EntrySeedHandler } from "@/components/home/EntrySeedHandler";

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <EntrySeedHandler />
      </Suspense>
      <HomePageContent />
    </>
  );
}
