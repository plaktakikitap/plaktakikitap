import Link from "next/link";
import { AdminReadingLogBookForm } from "@/components/admin/AdminReadingLogBookForm";
import type { BookStatus } from "@/types/database";
import { isBookStatus } from "@/types/database";

export default async function AdminReadingLogNewPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const defaultStatus: BookStatus | undefined = isBookStatus(params.status)
    ? params.status
    : undefined;
  const isLibrary = defaultStatus === "to_read";

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href={isLibrary ? "/secretgate/okunacaklar" : "/secretgate/reading-log"}
        className="text-sm text-[#6b6158] transition-colors hover:text-[#b8934a]"
      >
        ← {isLibrary ? "Kütüphanem" : "Okuma günlüğü"}
      </Link>
      <h1 className="admin-heading mt-4 text-2xl font-semibold text-[#1a1612]">
        {isLibrary ? "Kütüphaneye ekle" : "Yeni kitap"}
      </h1>
      <p className="mt-1 text-sm text-[#6b6158]">
        {isLibrary
          ? "Okunacak olarak kaydedilir; sitede görünmez."
          : "Kapak, sırt ve durum. /readings rafında görünür."}
      </p>
      <AdminReadingLogBookForm defaultStatus={defaultStatus} />
    </div>
  );
}
