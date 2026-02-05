"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { BookOpen, FileText, Heart } from "lucide-react";

export type TranslationsTab = "books" | "independent" | "volunteer";

const TABS: { value: TranslationsTab; label: string; icon: typeof BookOpen }[] = [
  { value: "books", label: "Kitaplar", icon: BookOpen },
  { value: "independent", label: "Bağımsız", icon: FileText },
  { value: "volunteer", label: "Gönüllü", icon: Heart },
];

export function useTranslationsTab(): [TranslationsTab, (tab: TranslationsTab) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as TranslationsTab) || "books";
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
      className="mb-8 flex gap-1 rounded-xl border border-amber-400/15 bg-white/5 p-1 backdrop-blur-sm"
      role="tablist"
    >
      {TABS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={tab === value}
          onClick={() => setTab(value)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === value
              ? "bg-amber-500/20 text-amber-800 dark:text-amber-200"
              : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}
