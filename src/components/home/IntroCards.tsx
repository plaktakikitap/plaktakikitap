"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { NavCard } from "@/components/home/NavCard";
import { NAV_CARDS } from "@/components/home/nav-cards";
import type { Video as VideoType } from "@/types/videos";
import { cn } from "@/lib/utils";

interface IntroCardsProps {
  latestVideo?: VideoType | null;
  latestVideoThumb?: string | null;
}

export function IntroCards({
  // reserved for future featured video card
  latestVideo: _latestVideo,
  latestVideoThumb: _latestVideoThumb,
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

  return (
    <section ref={ref} className="px-4 pt-5 pb-16 md:pt-6 md:pb-20">
      <div className="mx-auto max-w-5xl">
        {/* Bento: mobilde full width; sm+ 4 kolon, featured 2 kolon */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {NAV_CARDS.map((card, i) => (
            <motion.div
              key={card.href}
              layoutId={`card-${card.href}`}
              initial={{ opacity: 0, y: 12 }}
              animate={
                isVisible || reduce
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 12 }
              }
              transition={{
                duration: 0.4,
                delay: reduce ? 0 : i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "min-w-0",
                card.featured
                  ? "sm:col-span-2 lg:col-span-2"
                  : "sm:col-span-1"
              )}
            >
              <NavCard card={card} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
