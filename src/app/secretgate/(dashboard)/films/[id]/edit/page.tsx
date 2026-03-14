import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getFilmItem } from "@/lib/queries";
import { FilmForm } from "@/components/admin/FilmForm";

interface EditFilmPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFilmPage({ params }: EditFilmPageProps) {
  const { id } = await params;
  const item = await getFilmItem(id);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/secretgate/films"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Filmler
      </Link>
      <h1 className="text-2xl font-bold">Filmi düzenle</h1>
      <p className="mt-1 text-[var(--muted)]">{item.title}</p>
      <FilmForm item={item} />
    </div>
  );
}
