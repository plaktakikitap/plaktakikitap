import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookById } from "@/lib/db/queries";
import { AdminReadingLogBookForm } from "@/components/admin/AdminReadingLogBookForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminReadingLogEditPage({ params }: PageProps) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/admin/reading-log"
        className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Okuma günlüğü
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Kitap düzenle</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">{book.title}</p>
      <AdminReadingLogBookForm book={book} />
    </div>
  );
}
