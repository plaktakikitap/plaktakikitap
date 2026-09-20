"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";

type AramaTip = "kitap" | "film" | "dizi" | "karalama" | "yazi" | "foto";

type AramaSonuc = {
  id: string;
  tip: AramaTip;
  baslik: string;
  altyazi: string;
  url: string;
  gorsel: string | null;
};

const TIP_ETIKETLERI: Record<
  AramaTip,
  { label: string; renk: string }
> = {
  kitap: { label: "Kitap", renk: "#4a6b8f" },
  film: { label: "Film", renk: "#6b2c2c" },
  dizi: { label: "Dizi", renk: "#2c4a3e" },
  karalama: { label: "Karalama", renk: "#8f6b2c" },
  yazi: { label: "Yazı", renk: "#6b4a8f" },
  foto: { label: "Foto", renk: "#5a6b4a" },
};

export function AramaKutusu() {
  const [acik, setAcik] = useState(false);
  const [sorgu, setSorgu] = useState("");
  const [sonuclar, setSonuclar] = useState<AramaSonuc[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [secili, setSecili] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAcik(true);
      }
      if (e.key === "Escape") setAcik(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (acik) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [acik]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (sorgu.trim().length < 2) {
      setSonuclar([]);
      setYukleniyor(false);
      return;
    }
    setYukleniyor(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/arama?q=${encodeURIComponent(sorgu.trim())}`
        );
        const data = await res.json();
        setSonuclar((data.sonuclar ?? []) as AramaSonuc[]);
        setSecili(0);
      } catch {
        setSonuclar([]);
      } finally {
        setYukleniyor(false);
      }
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sorgu]);

  const kapat = useCallback(() => {
    setAcik(false);
    setSorgu("");
    setSonuclar([]);
    setSecili(0);
  }, []);

  const sonucaGit = useCallback(
    (url: string) => {
      router.push(url);
      kapat();
    },
    [router, kapat]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSecili((i) => Math.min(i + 1, Math.max(sonuclar.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSecili((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && sonuclar[secili]) {
      e.preventDefault();
      sonucaGit(sonuclar[secili]!.url);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAcik(true)}
        className="inline-flex items-center gap-2 rounded-md border border-[rgba(201,166,90,0.15)] bg-white/[0.04] px-3 py-1.5 text-[0.82rem] text-[#9a9488] transition hover:border-[rgba(201,166,90,0.3)] hover:text-[#c9a65a]"
        aria-label="Ara"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Ara</span>
        <kbd className="hidden rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-sans text-[0.7rem] text-[#6b6560] sm:inline">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {acik ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.15 }}
            onClick={kapat}
            className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/70 pt-[12vh] sm:pt-[15vh]"
            role="dialog"
            aria-modal="true"
            aria-label="Site araması"
          >
            <motion.div
              initial={
                reduceMotion ? false : { opacity: 0, y: -16, scale: 0.97 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -8, scale: 0.97 }
              }
              transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[92%] max-w-[560px] overflow-hidden rounded-xl border border-[rgba(201,166,90,0.25)] bg-[#111009] shadow-[0_24px_48px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center gap-3 border-b border-[rgba(201,166,90,0.1)] px-4 py-3.5 sm:px-5">
                <Search className="h-4 w-4 shrink-0 text-[#9a9488]" />
                <input
                  ref={inputRef}
                  value={sorgu}
                  onChange={(e) => setSorgu(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Kitap, film, dizi, karalama ara..."
                  className="min-w-0 flex-1 border-0 bg-transparent text-base text-[#f3ead9] outline-none placeholder:text-[#6b6560]"
                />
                {yukleniyor ? (
                  <span className="shrink-0 text-[0.8rem] text-[#9a9488]">
                    arıyor...
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={kapat}
                  className="rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-sans text-[0.72rem] text-[#6b6560]"
                >
                  ESC
                </button>
              </div>

              {sonuclar.length > 0 ? (
                <ul className="max-h-[360px] overflow-y-auto p-2">
                  {sonuclar.map((s, idx) => {
                    const tip = TIP_ETIKETLERI[s.tip];
                    const active = idx === secili;
                    return (
                      <li key={`${s.tip}-${s.id}`}>
                        <button
                          type="button"
                          onClick={() => sonucaGit(s.url)}
                          onMouseEnter={() => setSecili(idx)}
                          className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition ${
                            active ? "bg-[rgba(201,166,90,0.07)]" : ""
                          }`}
                        >
                          {s.gorsel ? (
                            <span className="relative h-11 w-8 shrink-0 overflow-hidden rounded-[3px] bg-white/5">
                              <Image
                                src={s.gorsel}
                                alt=""
                                fill
                                sizes="32px"
                                className="object-cover"
                                unoptimized
                              />
                            </span>
                          ) : (
                            <span className="h-11 w-8 shrink-0 rounded-[3px] bg-[rgba(201,166,90,0.1)]" />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.9rem] text-[#f3ead9]">
                              {s.baslik}
                            </span>
                            {s.altyazi ? (
                              <span className="mt-0.5 block truncate text-[0.78rem] text-[#9a9488]">
                                {s.altyazi}
                              </span>
                            ) : null}
                          </span>
                          <span
                            className="shrink-0 rounded-[3px] px-1.5 py-0.5 text-[0.68rem]"
                            style={{
                              background: `${tip.renk}33`,
                              color: tip.renk,
                            }}
                          >
                            {tip.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              {sorgu.trim().length >= 2 && !yukleniyor && sonuclar.length === 0 ? (
                <div className="px-5 py-8 text-center text-[0.88rem] text-[#9a9488]">
                  &ldquo;{sorgu.trim()}&rdquo; için sonuç bulunamadı
                </div>
              ) : null}

              <div className="flex gap-4 border-t border-[rgba(201,166,90,0.08)] px-5 py-2.5 text-[0.72rem] text-[#6b6560]">
                <span>↵ git</span>
                <span>↑↓ seç</span>
                <span>ESC kapat</span>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
