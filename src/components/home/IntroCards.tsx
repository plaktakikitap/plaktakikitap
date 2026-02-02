"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  User,
  FolderKanban,
  FileText,
  BookOpen,
  Film,
  Languages,
  type LucideIcon,
} from "lucide-react";

const CARDS: {
  href: string;
  label: string;
  subtitle: string;
  Icon: LucideIcon;
}[] = [
  {
    href: "/about",
    label: "Beni Tanıyın",
    subtitle: "kim olduğumu, nasıl düşündüğümü",
    Icon: User,
  },
  {
    href: "/projects",
    label: "Yaptıklarım",
    subtitle: "üretimler, projeler, denemeler",
    Icon: FolderKanban,
  },
  {
    href: "/posts",
    label: "Yazılarım",
    subtitle: "düşünceler, denemeler, parçalar",
    Icon: FileText,
  },
  {
    href: "/books",
    label: "Okuma Günlüğüm",
    subtitle: "altını çizdiklerim, notlarım",
    Icon: BookOpen,
  },
  {
    href: "/cinema",
    label: "İzleme Günlüğüm",
    subtitle: "film, dizi, sahne, detay",
    Icon: Film,
  },
  {
    href: "/translations",
    label: "Çevirilerim",
    subtitle: "metinler, notlar, tercih sebepleri",
    Icon: Languages,
  },
];

/** Merkezden dışarıya gecikme: 2x3 grid'de ortadaki kartlar (1,4) önce */
const STAGGER_FROM_CENTER = [0.08, 0, 0.08, 0.08, 0, 0.08];

/** Y salınımı için farklı süreler (saniye) */
const FLOAT_DURATIONS = [4.2, 3.8, 4.6, 3.5, 4.0, 3.9];

export function IntroCards() {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => setIsVisible(e.isIntersecting),
      { rootMargin: "80px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="px-4 pt-5 pb-16 md:pt-6 md:pb-20">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.href}
              layoutId={`card-${card.href}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={
                isVisible || reduce
                  ? {
                      opacity: 1,
                      scale: 1,
                      y: reduce ? 0 : [0, -6, 0],
                    }
                  : { opacity: 0, scale: 0.92, y: 0 }
              }
              transition={{
                opacity: { duration: 0.4, delay: STAGGER_FROM_CENTER[i] },
                scale: { duration: 0.45, delay: STAGGER_FROM_CENTER[i], ease: [0.22, 1, 0.36, 1] },
                y: reduce
                  ? {}
                  : {
                      duration: FLOAT_DURATIONS[i],
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: i * 0.3,
                    },
              }}
              className="flex justify-center"
            >
              <Link
                href={card.href}
                className="group flex w-full flex-col items-center justify-center rounded-xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-[12px] transition-all duration-300 hover:-translate-y-2 hover:bg-white/20 hover:border-amber-400/70 hover:shadow-[0_0_24px_rgba(251,191,36,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 md:p-8"
                style={{ minHeight: "140px" }}
              >
                <span className="flex flex-col items-center gap-3">
                  <card.Icon
                    className="h-8 w-8 text-white/95 md:h-9 md:w-9"
                    strokeWidth={1.8}
                    aria-hidden
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-sans text-base font-medium tracking-tight text-white md:text-lg">
                      {card.label}
                    </span>
                    <span className="font-sans text-xs font-normal tracking-wide text-white/75 md:text-sm">
                      {card.subtitle}
                    </span>
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
