import { getAdminMediaAssets } from "@/lib/db/queries";
import { MediaAssetsList } from "@/components/admin/MediaAssetsList";

export default async function AdminMediaPage() {
  const media = await getAdminMediaAssets();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pt-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Media Assets
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Images, videos, and links. YouTube/Vimeo URLs show a preview.
        </p>
      </header>
      <MediaAssetsList media={media} />
    </div>
  );
}
