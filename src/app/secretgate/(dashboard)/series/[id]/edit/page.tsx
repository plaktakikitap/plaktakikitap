import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSeriesItem } from "@/lib/queries";
import { SeriesForm } from "@/components/admin/SeriesForm";

interface EditSeriesPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSeriesPage({ params }: EditSeriesPageProps) {
  const { id } = await params;
  const item = await getSeriesItem(id);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/secretgate/series"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Diziler
      </Link>
      <h1 className="text-2xl font-bold">Diziyi düzenle</h1>
      <p className="mt-1 text-[var(--muted)]">{item.title}</p>
      <SeriesForm item={item} />
    </div>
  );
}
