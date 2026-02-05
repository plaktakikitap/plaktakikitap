"use client";

import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import type { Book } from "@/types/database";
import type { StatusFilterValue } from "./ReadingLogContent";
import { BookShelf } from "./BookShelf";
import { BookDetailModal } from "./BookDetailModal";
import { Search, X } from "lucide-react";

const SORT_OPTIONS = [
  { value: "end_date_desc", label: "En son biten" },
  { value: "created_at_desc", label: "En son eklenen" },
  { value: "rating_desc", label: "Puan" },
  { value: "page_count_desc", label: "Sayfa sayısı" },
  { value: "title_asc", label: "A-Z" },
] as const;

const STATUS_OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: "", label: "Tümü" },
  { value: "reading", label: "Okunuyor" },
  { value: "finished", label: "Bitti" },
  { value: "paused", label: "Duraklatıldı" },
  { value: "dropped", label: "Bırakıldı" },
];

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

interface ReadingLogBooksSectionProps {
  books: Book[];
  statusFilter: StatusFilterValue;
  onStatusFilterChange: (v: StatusFilterValue) => void;
}

function sortBooks(books: Book[], sortBy: SortValue): Book[] {
  const list = [...books];
  switch (sortBy) {
    case "end_date_desc":
      return list.sort((a, b) => {
        const da = a.end_date ? new Date(a.end_date).getTime() : 0;
        const db = b.end_date ? new Date(b.end_date).getTime() : 0;
        return db - da;
      });
    case "created_at_desc":
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case "rating_desc":
      return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "page_count_desc":
      return list.sort((a, b) => (b.page_count ?? 0) - (a.page_count ?? 0));
    case "title_asc":
      return list.sort((a, b) => a.title.localeCompare(b.title, "tr"));
    default:
      return list;
  }
}

export function ReadingLogBooksSection({
  books,
  statusFilter,
  onStatusFilterChange,
}: ReadingLogBooksSectionProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>("end_date_desc");

  const filteredAndSortedBooks = useMemo(() => {
    let list = books;
    if (statusFilter) {
      list = list.filter((book) => book.status === statusFilter);
    }
    if (filterTag) {
      list = list.filter((book) => (book.tags ?? []).includes(filterTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (book) =>
          book.title.toLowerCase().includes(q) ||
          (book.author && book.author.toLowerCase().includes(q))
      );
    }
    return sortBooks(list, sortBy);
  }, [books, statusFilter, filterTag, searchQuery, sortBy]);

  return (
    <>
      {/* Controls: top-right row */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Tag pill when active */}
        <div className="flex flex-wrap items-center gap-2">
          {filterTag ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/20 px-2.5 py-1 text-sm text-amber-200">
              <button
                type="button"
                onClick={() => setFilterTag(null)}
                className="rounded-full p-0.5 hover:bg-amber-400/30"
                aria-label={`Etiket ${filterTag} filtresini kaldır`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
              #{filterTag}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <label className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Başlık / yazar..."
              className="w-40 rounded-lg border border-white/20 bg-white/10 py-1.5 pl-8 pr-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30 sm:w-48"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as StatusFilterValue)}
            className="rounded-lg border border-white/20 bg-white/10 py-1.5 pl-3 pr-8 text-sm text-white focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortValue)}
            className="rounded-lg border border-white/20 bg-white/10 py-1.5 pl-3 pr-8 text-sm text-white focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <BookShelf books={filteredAndSortedBooks} onSelectBook={setSelectedBook} />
      <AnimatePresence mode="wait">
        {selectedBook ? (
          <BookDetailModal
            key={selectedBook.id}
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onTagClick={setFilterTag}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
