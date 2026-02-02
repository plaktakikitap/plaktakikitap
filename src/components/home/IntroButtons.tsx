"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

const BUTTONS = [
  { href: "/about", label: "Beni Tanıyın" },
  { href: "/projects", label: "Yaptıklarım" },
  { href: "/books", label: "Okuma Günlüğüm" },
  { href: "/cinema", label: "İzleme Günlüğüm" },
  { href: "/translations", label: "Çevirilerim" },
  { href: "/posts", label: "Yazılarım" },
];

const STAGGER_DELAY = 0.12;

export function IntroButtons() {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => setIsVisible(e.isIntersecting),
      { rootMargin: "100px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="px-4 pt-4 pb-16 md:pt-5 md:pb-20">
      <div className="mx-auto max-w-6xl overflow-x-auto">
        <div className="flex flex-nowrap justify-center gap-3 min-w-0">
          {BUTTONS.map((btn, i) => (
            <motion.div
              key={btn.href}
              initial={{ opacity: 0 }}
              animate={
                isVisible || reduce
                  ? { opacity: 1 }
                  : { opacity: 0 }
              }
              transition={{
                duration: 0.45,
                delay: reduce ? 0 : isVisible ? i * STAGGER_DELAY : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="shrink-0"
            >
              <Link
                href={btn.href}
                className="block whitespace-nowrap rounded-full border border-[#F3EBDD]/25 bg-[rgba(10,14,24,0.6)] px-4 py-2.5 text-center font-sans text-xs font-normal tracking-[0.04em] text-[#F3EBDD] shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[rgba(243,235,221,0.12)] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F3EBDD]/40 md:px-5 md:py-3 md:text-sm"
              >
                {btn.label}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
