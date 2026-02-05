import { createAdminClient } from "@/lib/supabase/admin";
import type { PublishedBook } from "@/types/database";
import { AdminPublishedBooksPanel } from "@/components/admin/AdminPublishedBooksPanel";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default async function AdminPublishedBooksPage() {
  const supabase = createAdminClient();
  const { data: books } = await supabase
    .from("published_books")
    .select("*")
    .order("order_index", { ascending: true })
    .order("year", { ascending: false, nullsFirst: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-xl font-semibold">
        <BookOpen className="h-5 w-5" />
        Yayınlanmış kitaplar
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Çeviriler sayfasında dikey kartlar olarak gösterilir. Yolda olanlar için &quot;Çok Yakında&quot; bandı eklenir.
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        <Link href="/translations" className="text-[var(--accent)] underline hover:no-underline">
          Çeviriler sayfasını görüntüle
        </Link>
      </p>
      <AdminPublishedBooksPanel books={(books ?? []) as PublishedBook[]} />
    </div>
  );
}
