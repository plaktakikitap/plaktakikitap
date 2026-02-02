import Link from "next/link";
import { motion } from "framer-motion";
import { getBooks } from "@/lib/queries";
import { Plus, Pencil } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminBooksPage() {
  const books = await getBooks(true);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kitaplar</h1>
          <p className="mt-1 text-[var(--muted)]">{books.length} kitap</p>
        </div>
        <Link
          href="/admin/books/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Yeni Kitap
        </Link>
      </div>

      <div className="space-y-2">
        {books.map((item, i) => {
          const book = Array.isArray(item.book) ? item.book[0] : item.book;
          if (!book) return null;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-3"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-[var(--muted)]">
                  {book.author && `${book.author} • `}
                  {item.visibility}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/books/${item.id}/edit`}
                  className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteButton id={item.id} type="book" label={item.title} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {books.length === 0 && (
        <p className="text-center text-[var(--muted)]">Henüz kitap eklenmemiş.</p>
      )}
    </div>
  );
}
