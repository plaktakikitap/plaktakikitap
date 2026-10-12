import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BookForm } from "@/components/admin/BookForm";

export default function NewBookPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/secretgate/books"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Kitaplar
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Yeni Kitap</h1>
        <p className="mt-1 text-[var(--muted)]">Kitap bilgilerini girin</p>
        <BookForm />
      </div>
    </div>
  );
}
