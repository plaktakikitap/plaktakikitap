import type { Metadata } from "next";
import { getPortfolioPublic } from "@/lib/portfolio";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import { PortfolioContent } from "@/components/portfolio/PortfolioContent";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Portfolyo | Plaktaki Kitap",
  description: "Afiş, sosyal medya, fotoğraf ve video işleri",
};

export default async function PortfolyoPage() {
  let items: Awaited<ReturnType<typeof getPortfolioPublic>> = [];
  try {
    items = await getPortfolioPublic();
  } catch {
    // Supabase not configured
  }

  return (
    <PageTransitionTarget layoutId="card-/portfolyo">
      <main className="relative min-h-screen bg-transparent text-ink">
        <PortfolioContent items={items} />
      </main>
    </PageTransitionTarget>
  );
}
