import { getPublicTranslations } from "@/lib/db/queries";
import { TranslationsGrid } from "@/components/translations/TranslationsGrid";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";

export default async function TranslationsPage() {
  const translations = await getPublicTranslations();

  return (
    <PageTransitionTarget layoutId="card-/translations">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageHeader
          layoutId="nav-/translations"
          title="Translations"
          subtitle="Kitap çevirileri"
        />
        <TranslationsGrid translations={translations} />
      </div>
    </PageTransitionTarget>
  );
}
