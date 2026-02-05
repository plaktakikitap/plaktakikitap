import Link from "next/link";
import { AdminReadingLogBookForm } from "@/components/admin/AdminReadingLogBookForm";

export default function AdminReadingLogNewPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/admin/reading-log"
        className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Okuma günlüğü
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Yeni kitap</h1>
      <AdminReadingLogBookForm />
    </div>
  );
}
