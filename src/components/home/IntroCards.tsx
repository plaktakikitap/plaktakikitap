"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { NavCard } from "@/components/home/NavCard";
import { NAV_CARDS } from "@/components/home/nav-cards";
import type { Video as VideoType } from "@/types/videos";

/** Merkezden dışarıya gecikme; 8 kart */
const STAGGER_FROM_CENTER = [0.08, 0, 0.08, 0.08, 0, 0.08, 0.08, 0];

/** Y salınımı için farklı süreler (saniye) */
const FLOAT_DURATIONS = [4.2, 3.8, 4.6, 3.5, 4.0, 3.9, 3.7, 4.1];

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

  return (
    <section ref={ref} className="px-4 pt-5 pb-16 md:pt-6 md:pb-20">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {NAV_CARDS.map((card, i) => (
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
              <NavCard card={card} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
