import Link from "next/link";
import { getBooks } from "@/lib/queries";
import { Plus } from "lucide-react";
import { ExcelIndirButonu } from "@/components/admin/ExcelIndirButonu";
import { AdminBooksClient } from "@/components/admin/AdminBooksClient";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage() {
  const books = await getBooks(true);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Kitaplar</h1>
          <p className="mt-1 text-[var(--muted)]">{books.length} kitap</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExcelIndirButonu tur="kitaplar" />
          <Link
            href="/secretgate/books/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Yeni Kitap
          </Link>
        </div>
      </div>

      <AdminBooksClient books={books} />
    </div>
  );
}
