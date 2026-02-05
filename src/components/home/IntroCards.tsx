"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  User,
  FolderKanban,
  FileText,
  BookOpen,
  Film,
  Languages,
  Camera,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { Video as VideoType } from "@/types/videos";

const CARDS: {
  href: string;
  label: string;
  subtitle: string;
  Icon: LucideIcon;
  isVideos?: boolean;
}[] = [
  // Üst sıra: Beni Tanıyın, Okuma günlüğüm, İzleme günlüğüm, Fotoğraflar
  {
    href: "/beni-taniyin",
    label: "Beni Tanıyın",
    subtitle: "kimdir bu eymen?",
    Icon: User,
  },
  {
    href: "/okuma-gunlugum",
    label: "Okuma Günlüğüm",
    subtitle: "altını çizdiklerim, notlarım",
    Icon: BookOpen,
  },
  {
    href: "/izleme-gunlugum",
    label: "İzleme Günlüğüm",
    subtitle: "izlediğim diziler, filmler ve onlara olan yorumlarım",
    Icon: Film,
  },
  {
    href: "/photos",
    label: "Fotoğraflar",
    subtitle: "benim gözümden dünya",
    Icon: Camera,
  },
  // Alt sıra: Yaptıklarım, Çevirilerim, Videolar, Yazılarım
  {
    href: "/works",
    label: "Yaptıklarım",
    subtitle: "üretimler, projeler",
    Icon: FolderKanban,
  },
  {
    href: "/cevirilerim",
    label: "Çevirilerim",
    subtitle: "yayınlanmış kitaplarım, gönüllü çevirilerim",
    Icon: Languages,
  },
  {
    href: "/videos",
    label: "Plaktaki Kitap Videoları",
    subtitle: "",
    Icon: Video,
    isVideos: true,
  },
  {
    href: "/yazilarim",
    label: "Yazılarım",
    subtitle: "düşünceler, denemeler, parçalar",
    Icon: FileText,
  },
];

/** Merkezden dışarıya gecikme; 8 kart */
const STAGGER_FROM_CENTER = [0.08, 0, 0.08, 0.08, 0, 0.08, 0.08, 0];

/** Y salınımı için farklı süreler (saniye) */
const FLOAT_DURATIONS = [4.2, 3.8, 4.6, 3.5, 4.0, 3.9, 3.7, 4.1];

function shortenTitle(title: string, maxLen: number = 32): string {
  if (title.length <= maxLen) return title;
  return title.slice(0, maxLen - 1).trim() + "…";
}

interface IntroCardsProps {
  latestVideo?: VideoType | null;
  latestVideoThumb?: string | null;
}

export function IntroCards({
  latestVideo,
  latestVideoThumb,
}: IntroCardsProps = {}) {
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

  const showVideosPoster =
    latestVideo && latestVideoThumb && CARDS.some((c) => c.isVideos);

  return (
    <section ref={ref} className="px-4 pt-5 pb-16 md:pt-6 md:pb-20">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {CARDS.map((card, i) => {
            const isVideosWithPoster =
              card.isVideos && showVideosPoster && latestVideo && latestVideoThumb;

            return (
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
                  scale: {
                    duration: 0.45,
                    delay: STAGGER_FROM_CENTER[i],
                    ease: [0.22, 1, 0.36, 1],
                  },
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
                  className="group flex w-full flex-col items-center justify-center rounded-xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-[12px] transition-all duration-300 hover:-translate-y-2 hover:bg-white/20 hover:border-amber-400/70 hover:shadow-[0_0_24px_rgba(251,191,36,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 sm:p-6 md:p-8"
                  style={{ minHeight: "120px" }}
                >
                  {isVideosWithPoster ? (
                    <span className="relative flex w-full flex-col items-center gap-2 overflow-hidden rounded-lg">
                      <span className="relative aspect-video w-full max-w-[200px] overflow-hidden rounded-md border border-white/20">
                        <Image
                          src={latestVideoThumb}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      </span>
                      <span className="line-clamp-2 font-sans text-sm font-medium tracking-tight text-white">
                        {shortenTitle(latestVideo.title)}
                      </span>
                      <span className="font-sans text-xs font-normal tracking-wide text-white/70">
                        Plaktaki Kitap
                      </span>
                    </span>
                  ) : (
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
                        {card.subtitle ? (
                          <span className="font-sans text-xs font-normal tracking-wide text-white/75 md:text-sm">
                            {card.subtitle}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
