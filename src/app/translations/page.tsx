import { Suspense } from "react";
import {
  getTranslationsSettings,
  getTranslationBooksPublic,
  getTranslationIndependentPublic,
  getTranslationVolunteerPublic,
} from "@/lib/db/queries";
import { TranslationsHero } from "@/components/translations/TranslationsHero";
import { TranslationsBooksSection } from "@/components/translations/TranslationsBooksSection";
import { TranslationsIndependentSection } from "@/components/translations/TranslationsIndependentSection";
import { TranslationsAcademiaSection } from "@/components/translations/TranslationsAcademiaSection";
import { TranslationsVolunteerSection } from "@/components/translations/TranslationsVolunteerSection";
import { TranslationsTabBar } from "@/components/translations/TranslationsTabBar";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getTranslationsSettings();
  const description = settings?.intro_body
    ? settings.intro_body.slice(0, 140).replace(/\n/g, " ") + (settings.intro_body.length > 140 ? "…" : "")
    : "Kitap çevirileri ve çeviri projeleri.";
  return {
    title: "Çevirilerim | Plaktaki Kitap",
    description,
  };
}

export default async function TranslationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [settings, books, independent, volunteer] = await Promise.all([
    getTranslationsSettings(),
    getTranslationBooksPublic(),
    getTranslationIndependentPublic(),
    getTranslationVolunteerPublic(),
  ]);

  const tab = (await searchParams).tab as "books" | "independent" | "volunteer" | undefined;
  const showBooks = !tab || tab === "books";
  const showIndependent = !tab || tab === "independent";
  const showVolunteer = !tab || tab === "volunteer";

  return (
    <PageTransitionTarget layoutId="card-/translations">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageHeader
          layoutId="nav-/translations"
          title="Çevirilerim"
          subtitle="Kitap çevirileri ve projeler"
        />
        <Suspense fallback={null}>
          <TranslationsTabBar />
        </Suspense>
        <TranslationsHero settings={settings} />
        {showBooks && <TranslationsBooksSection books={books} />}
        {showIndependent && <TranslationsIndependentSection items={independent} />}
        {showIndependent && (
          <TranslationsAcademiaSection
            profileUrl={settings?.academia_profile_url ?? null}
            items={independent}
          />
        )}
        {showVolunteer && <TranslationsVolunteerSection projects={volunteer} />}
      </div>
    </PageTransitionTarget>
  );
}
