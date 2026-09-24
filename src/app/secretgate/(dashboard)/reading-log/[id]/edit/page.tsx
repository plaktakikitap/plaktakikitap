import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookById } from "@/lib/db/queries";
import { AdminReadingLogBookForm } from "@/components/admin/AdminReadingLogBookForm";
import { AdminBookQuotes } from "@/components/admin/AdminBookQuotes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminReadingLogEditPage({ params }: PageProps) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/secretgate/reading-log"
        className="text-sm text-[#6b6158] transition-colors hover:text-[#b8934a]"
      >
        ← Okuma günlüğü
      </Link>
      <h1 className="admin-heading mt-4 text-2xl font-semibold text-[#1a1612]">Kitap düzenle</h1>
      <p className="mt-1 text-sm text-[#6b6158]">{book.title}</p>
      <AdminReadingLogBookForm book={book} />
      <AdminBookQuotes bookId={book.id} />
    </div>
  );
}
