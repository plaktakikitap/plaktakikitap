"use client";

import { useState } from "react";
import { BookMarked, BookOpen } from "lucide-react";
import { AdminReadingLogBooksList } from "./AdminReadingLogBooksList";
import { AdminToReadList } from "./AdminToReadList";
import type { Book } from "@/types/database";

export function AdminReadingLogTabs({
  logBooks,
  toReadBooks,
}: {
  logBooks: Book[];
  toReadBooks: Book[];
}) {
  const [tab, setTab] = useState<"log" | "toread">("log");
  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-xl border border-[#e8e0d4] bg-[#f4f0ea] p-1">
        <button
          type="button"
          onClick={() => setTab("log")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "log"
              ? "bg-white text-[#1a1612] shadow-sm"
              : "text-[#6b6158] hover:text-[#1a1612]"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Günlük ({logBooks.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("toread")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "toread"
              ? "bg-white text-[#1a1612] shadow-sm"
              : "text-[#6b6158] hover:text-[#1a1612]"
          }`}
        >
          <BookMarked className="h-4 w-4" />
          Okunacaklar ({toReadBooks.length})
        </button>
      </div>

      {tab === "log" ? (
        <AdminReadingLogBooksList initialBooks={logBooks} />
      ) : (
        <AdminToReadList initialBooks={toReadBooks} />
      )}
    </div>
  );
}
