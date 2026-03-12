"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { BookOpen, FileText, Heart, LayoutGrid } from "lucide-react";

export type TranslationsTab = "all" | "books" | "independent" | "volunteer";

const TABS: { value: TranslationsTab; label: string; icon: typeof LayoutGrid }[] = [
  { value: "all", label: "Tümü", icon: LayoutGrid },
  { value: "books", label: "Kitaplar", icon: BookOpen },
  { value: "independent", label: "Bağımsız", icon: FileText },
  { value: "volunteer", label: "Gönüllü", icon: Heart },
];

export function useTranslationsTab(): [TranslationsTab, (tab: TranslationsTab) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as TranslationsTab) || "all";
  const setTab = useCallback(
    (t: TranslationsTab) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("tab", t);
      router.replace(`/translations?${next.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );
  return [tab, setTab];
}

export function TranslationsTabBar() {
  const [tab, setTab] = useTranslationsTab();

  return (
    <nav
      className="mb-8 flex gap-0.5 rounded-xl border border-amber-400/15 bg-white/5 p-1 backdrop-blur-sm sm:gap-1"
      role="tablist"
    >
      {TABS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={tab === value}
          onClick={() => setTab(value)}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${
            tab === value
              ? "bg-amber-500/25 text-white"
              : "text-white/70 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}
