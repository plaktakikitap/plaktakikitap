"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  BookMarked,
  BookOpen,
  Clock,
  Pause,
  Pencil,
  Search,
  XCircle,
} from "lucide-react";
import { DeleteButton } from "./DeleteButton";
import type { Book, BookStatus } from "@/types/database";
import { usableBookCoverUrl } from "@/lib/book-cover";

const STATUS_LABELS: Record<BookStatus | "all", string> = {
  all: "Tümü",
  reading: "Okunuyor",
  finished: "Bitti",
  to_read: "Okunacak",
  paused: "Duraklatıldı",
  dropped: "Bırakıldı",
};

const STATUS_ICONS: Record<BookStatus | "all", ReactNode> = {
  all: null,
  reading: <BookOpen className="h-3.5 w-3.5" />,
  finished: <BookMarked className="h-3.5 w-3.5" />,
  to_read: <Clock className="h-3.5 w-3.5" />,
  paused: <Pause className="h-3.5 w-3.5" />,
  dropped: <XCircle className="h-3.5 w-3.5" />,
};

const STATUS_COLORS: Record<BookStatus | "all", string> = {
  all: "bg-[var(--card)] text-[var(--foreground)]",
  reading: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  finished: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  to_read: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  paused: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  dropped: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const FILTERS = ["all", "finished", "reading", "to_read", "paused", "dropped"] as const;

type SortKey = "newest" | "az" | "rating";

export function AdminBooksClient({ books }: { books: Book[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<BookStatus | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const counts = useMemo(() => {
    const c: Record<BookStatus | "all", number> = {
      all: books.length,
      reading: 0,
      finished: 0,
      to_read: 0,
      paused: 0,
      dropped: 0,
    };
    for (const book of books) {
      if (book.status in c) c[book.status] += 1;
    }
    return c;
  }, [books]);

  const filtered = useMemo(() => {
    let list = books;
    if (filter !== "all") list = list.filter((book) => book.status === filter);

    const q = query.trim().toLocaleLowerCase("tr");
    if (q) {
      list = list.filter(
        (book) =>
          book.title.toLocaleLowerCase("tr").includes(q) ||
          (book.author ?? "").toLocaleLowerCase("tr").includes(q)
      );
    }

    if (sort === "az") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, "tr"));
    } else if (sort === "rating") {
      list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    return list;
  }, [books, filter, query, sort]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-all ${
              filter === status
                ? `border-[var(--accent)] ring-2 ring-[var(--accent)]/20 ${STATUS_COLORS[status]}`
                : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--accent)]/40"
            }`}
          >
            <span className="text-2xl font-bold tabular-nums">{counts[status]}</span>
            <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
              {STATUS_ICONS[status]}
              {STATUS_LABELS[status]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Başlık veya yazar ara..."
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] py-2 pl-9 pr-3 text-sm focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
          aria-label="Sıralama"
          className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
        >
          <option value="newest">En yeni</option>
          <option value="az">A → Z</option>
          <option value="rating">Puana göre</option>
        </select>
        <span className="text-sm text-[var(--muted)]">{filtered.length} kitap</span>
      </div>

      <div className="space-y-1.5">
        {filtered.map((book) => {
          const status = book.status;
          const pages = book.page_count > 1 ? book.page_count : null;
          return (
            <div
              key={book.id}
              className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2.5 transition-colors hover:border-[var(--accent)]/30"
            >
              <CoverThumb title={book.title} src={book.cover_url} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium leading-tight">{book.title}</p>
                <p className="truncate text-xs text-[var(--muted)]">
                  {book.author?.trim() ? book.author : "—"}
                  {pages ? ` · ${pages} sayfa` : ""}
                  {book.rating ? ` · ★ ${book.rating}` : ""}
                </p>
              </div>
              <span
                className={`hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex ${STATUS_COLORS[status]}`}
              >
                {STATUS_ICONS[status]}
                {STATUS_LABELS[status]}
              </span>
              <div className="flex shrink-0 gap-1">
                <Link
                  href={`/secretgate/books/${book.id}/edit`}
                  aria-label={`${book.title} düzenle`}
                  className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteButton id={book.id} type="book" label={book.title} />
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-[var(--muted)]">
          {query || filter !== "all" ? "Arama sonucu yok." : "Henüz kitap eklenmemiş."}
        </p>
      )}
    </div>
  );
}

function CoverThumb({ title, src }: { title: string; src: string | null }) {
  const [failed, setFailed] = useState(false);
  const cover = failed ? null : usableBookCoverUrl(src);

  return (
    <div className="h-12 w-9 shrink-0 overflow-hidden rounded-md bg-[var(--background)]">
      {cover ? (
        // Kapaklar Open Library ve depolama adreslerinden gelir; bozuk adreste ikona düşer.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          width={36}
          height={48}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
          <BookOpen className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
