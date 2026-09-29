"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  FileText,
  BookOpen,
  Languages,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import type { AdminAramaSonuc, AdminAramaTur } from "@/types/admin-arama";

const TUR_ICON: Record<AdminAramaTur, LucideIcon> = {
  yazi: FileText,
  ceviri: BookOpen,
  kitap: BookOpen,
  not: StickyNote,
  kelime: Languages,
};

const TUR_ETIKET: Record<AdminAramaTur, string> = {
  yazi: "Yazı",
  ceviri: "Çeviri",
  kitap: "Kitap",
  not: "Not",
  kelime: "Kelime",
};

export default function GlobalArama({
  variant = "button",
  shortcut = true,
  compact,
  onOpen,
}: {
  variant?: "button" | "icon";
  shortcut?: boolean;
  compact?: boolean;
  onOpen?: () => void;
}) {
  const [acik, setAcik] = useState(false);
  const [sorgu, setSorgu] = useState("");
  const [sonuclar, setSonuclar] = useState<AdminAramaSonuc[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [secilenIndex, setSecilenIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const zamanRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const ac = useCallback(() => {
    onOpen?.();
    setAcik(true);
  }, [onOpen]);

  useEffect(() => {
    if (!shortcut) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAcik((p) => !p);
      }
      if (e.key === "Escape") setAcik(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcut]);

  useEffect(() => {
    if (acik) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    setSorgu("");
    setSonuclar([]);
    setSecilenIndex(0);
  }, [acik]);

  useEffect(() => {
    if (zamanRef.current) clearTimeout(zamanRef.current);
    if (sorgu.trim().length < 2) {
      setSonuclar([]);
      setYukleniyor(false);
      return;
    }

    setYukleniyor(true);
    zamanRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/arama?q=${encodeURIComponent(sorgu.trim())}`
        );
        const data = await res.json();
        setSonuclar((data.sonuclar ?? []) as AdminAramaSonuc[]);
        setSecilenIndex(0);
      } catch {
        setSonuclar([]);
      } finally {
        setYukleniyor(false);
      }
    }, 300);

    return () => {
      if (zamanRef.current) clearTimeout(zamanRef.current);
    };
  }, [sorgu]);

  const git = useCallback(
    (href: string) => {
      router.push(href);
      setAcik(false);
    },
    [router]
  );

  const klavyeHandle = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSecilenIndex((p) =>
          Math.min(p + 1, Math.max(sonuclar.length - 1, 0))
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSecilenIndex((p) => Math.max(p - 1, 0));
      } else if (e.key === "Enter" && sonuclar[secilenIndex]) {
        git(sonuclar[secilenIndex]!.href);
      }
    },
    [sonuclar, secilenIndex, git]
  );

  const trigger =
    variant === "icon" ? (
      <button
        type="button"
        onClick={ac}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#1a1612]/70 hover:bg-[#1a1612]/8"
        aria-label="Ara"
        title="Ara (⌘K)"
      >
        <Search className="h-5 w-5" />
      </button>
    ) : (
      <button
        type="button"
        onClick={ac}
        className="flex w-full items-center gap-2 rounded-lg bg-[#e8e0d4]/50 px-3 py-1.5 text-sm text-[#6b6158] transition-colors hover:bg-[#e8e0d4]"
      >
        <Search size={14} className="shrink-0" />
        <span
          className={
            compact ? "hidden xl:inline" : "inline"
          }
        >
          Ara
        </span>
        <kbd
          className={`ml-auto rounded border border-[#e8e0d4] bg-white/60 px-1.5 py-0.5 text-xs ${
            compact ? "hidden xl:inline" : "inline"
          }`}
        >
          ⌘K
        </kbd>
      </button>
    );

  return (
    <>
      {trigger}
      {acik ? (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[15vh]"
          onClick={() => setAcik(false)}
        >
          <div className="absolute inset-0 bg-[#1a1612]/30 backdrop-blur-sm" />

          <div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#e8e0d4] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Admin araması"
          >
            <div className="flex items-center gap-3 border-b border-[#e8e0d4] px-4 py-3">
              <Search size={18} className="flex-shrink-0 text-[#6b6158]" />
              <input
                ref={inputRef}
                value={sorgu}
                onChange={(e) => setSorgu(e.target.value)}
                onKeyDown={klavyeHandle}
                placeholder="Yazı, kitap, kelime, not ara..."
                className="flex-1 bg-transparent text-sm text-[#1a1612] outline-none placeholder:text-[#6b6158]/50"
              />
              {yukleniyor ? (
                <span className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-[#b8934a]/30 border-t-[#b8934a]" />
              ) : null}
              <button
                type="button"
                onClick={() => setAcik(false)}
                className="text-[#6b6158] hover:text-[#1a1612]"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>

            {sonuclar.length > 0 ? (
              <div className="max-h-80 overflow-y-auto py-2">
                {sonuclar.map((s, i) => {
                  const Icon = TUR_ICON[s.tur];
                  return (
                    <button
                      key={`${s.tur}-${s.id}`}
                      type="button"
                      onClick={() => git(s.href)}
                      onMouseEnter={() => setSecilenIndex(i)}
                      className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                        i === secilenIndex
                          ? "bg-[#b8934a]/8"
                          : "hover:bg-[#faf7f2]"
                      }`}
                    >
                      <Icon
                        size={16}
                        className="mt-0.5 flex-shrink-0 text-[#6b6158]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-[#1a1612]">
                          {s.baslik}
                        </p>
                        {s.alt ? (
                          <p className="truncate text-xs text-[#6b6158]">
                            {s.alt}
                          </p>
                        ) : null}
                      </div>
                      <span className="flex-shrink-0 rounded bg-[#e8e0d4]/50 px-1.5 py-0.5 text-xs text-[#6b6158]/60">
                        {TUR_ETIKET[s.tur]}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {sorgu.trim().length >= 2 &&
            !yukleniyor &&
            sonuclar.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#6b6158]">
                &ldquo;{sorgu.trim()}&rdquo; için sonuç bulunamadı
              </div>
            ) : null}

            {sorgu.trim().length < 2 ? (
              <div className="px-4 py-4 text-xs text-[#6b6158]">
                En az 2 karakter gir
              </div>
            ) : null}

            <div className="flex items-center gap-3 border-t border-[#e8e0d4] px-4 py-2 text-xs text-[#6b6158]/60">
              <span>↑↓ seç</span>
              <span>↵ git</span>
              <span>Esc kapat</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
