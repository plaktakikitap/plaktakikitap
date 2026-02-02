import { getPublicArt } from "@/lib/db/queries";
import { ArtGrid } from "@/components/art/ArtGrid";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function ArtPage() {
  const items = await getPublicArt();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        layoutId="nav-/art"
        title="Art"
        subtitle="Sanat çalışmaları"
      />
      <ArtGrid items={items} />
    </div>
  );
}
