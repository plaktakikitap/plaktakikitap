import { BookMarked, Plus } from "lucide-react";
import Link from "next/link";
import { getBooks } from "@/lib/queries";
import { OkunacaklarPanel } from "@/components/admin/OkunacaklarPanel";

export const dynamic = "force-dynamic";

export default async function OkunacaklarPage() {
  const allBooks = await getBooks(true);
  const nowReading = allBooks
    .filter((b) => b.status === "reading")
    .sort(
      (a, b) =>
        Number(Boolean(b.is_featured_current)) - Number(Boolean(a.is_featured_current))
    );
  const toRead = allBooks.filter((b) => b.status === "to_read");
  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="admin-heading flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
              <BookMarked className="h-6 w-6 text-[#b8934a]" />
              Kütüphanem
            </h1>
            <p className="mt-2 text-sm text-[#6b6158]">
              Okumak istediğin kitaplar. Şu an okuyorum dersen sitede çıkar; bitirince rafa geçer.
            </p>
          </div>
          <Link
            href="/secretgate/reading-log/new?status=to_read"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#e8e0d4] bg-[#faf7f2] px-3 py-2 text-xs font-medium text-[#1a1612] transition-colors hover:border-[#b8934a]/30 hover:bg-[#b8934a]/5"
          >
            <Plus className="h-3.5 w-3.5 text-[#b8934a]" />
            Kitap ekle
          </Link>
        </div>
      </header>
      <OkunacaklarPanel initialToRead={toRead} initialNowReading={nowReading} />
    </div>
  );
}
