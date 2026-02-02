import { getPublicBooks } from "@/lib/db/queries";
import { BooksGrid } from "@/components/books/BooksGrid";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";

export default async function BooksPage() {
  const books = await getPublicBooks();

  return (
    <PageTransitionTarget layoutId="card-/books">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageHeader
          layoutId="nav-/books"
          title="Books"
          subtitle="Reading list and notes"
        />
        <BooksGrid books={books} />
      </div>
    </PageTransitionTarget>
  );
}
