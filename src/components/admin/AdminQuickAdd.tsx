"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Film, Tv, BookOpen } from "lucide-react";

export function AdminQuickAdd() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-6 top-20 z-40 lg:top-6">
      <div
        className={`absolute right-0 top-0 flex flex-col gap-1 rounded-2xl border border-white/10 bg-black/50 p-2 shadow-2xl backdrop-blur-xl transition-all duration-200 ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <Link
          href="/admin/films/new"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/90 transition-colors hover:bg-white/10"
          onClick={() => setOpen(false)}
        >
          <Film className="h-5 w-5 text-amber-400" />
          Film Ekle
        </Link>
        <Link
          href="/admin/series/new"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/90 transition-colors hover:bg-white/10"
          onClick={() => setOpen(false)}
        >
          <Tv className="h-5 w-5 text-amber-400" />
          Dizi Ekle
        </Link>
        <Link
          href="/admin/books/new"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/90 transition-colors hover:bg-white/10"
          onClick={() => setOpen(false)}
        >
          <BookOpen className="h-5 w-5 text-amber-400" />
          Kitap Ekle
        </Link>
      </div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="admin-btn-gold flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-transform hover:scale-105"
        aria-label="Hızlı Ekle"
      >
        <Plus className={`h-7 w-7 text-[#0d1117] transition-transform ${open ? "rotate-45" : ""}`} />
      </button>
    </div>
  );
}
