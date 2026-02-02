"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import type { SlideData } from "./Slide";
import { Slide } from "./Slide";
import { Dots } from "./Dots";

/** Mood overlay colors per slide — active slide gets subtle tint */
const MOOD_OVERLAYS: Record<string, string> = {
  cinema: "rgba(10,10,12,0.25)",
  books: "rgba(196,165,116,0.15)",
  writing: "rgba(250,250,248,0.02)",
  translations: "rgba(180,170,160,0.12)",
  planner: "rgba(245,240,230,0.2)",
};

interface DeckProps {
  slides: SlideData[];
  initialStats?: Record<string, unknown>;
}

export function Deck({ slides }: DeckProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const fn = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const scrollToSlide = useCallback(
    (index: number) => {
      const el = containerRef.current;
      if (!el) return;
      const slide = el.children[index] as HTMLElement | undefined;
      if (slide) {
        slide.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      }
    },
    [reducedMotion]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = Array.from(el.children).indexOf(e.target);
            if (idx >= 0) setActiveIndex(idx);
          }
        }
      },
      {
        root: el,
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      }
    );

    Array.from(el.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [slides.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollToSlide(Math.min(activeIndex + 1, slides.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToSlide(Math.max(activeIndex - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, scrollToSlide, slides.length]);

  const activeMood =
    slides[activeIndex]?.id ? MOOD_OVERLAYS[slides[activeIndex].id] ?? "transparent" : "transparent";

  return (
    <div className="relative bg-[#F9F9F9]">
      {/* Grain + vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-20"
        aria-hidden
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
            mixBlendMode: "multiply",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 50%, rgba(0,0,0,0.03) 100%)",
          }}
        />
      </div>

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-auto overflow-x-hidden scroll-smooth"
        style={{
          scrollSnapType: "y mandatory",
          scrollBehavior: reducedMotion ? "auto" : "smooth",
        }}
      >
        {slides.map((slide, i) => (
          <Slide
            key={slide.id}
            data={slide}
            isActive={i === activeIndex}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      {/* Mood overlay — transitions when active slide changes */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-30"
        animate={{ backgroundColor: activeMood }}
        transition={{ duration: 0.7 }}
        style={{ mixBlendMode: "multiply" }}
        aria-hidden
      />

      {/* Dot navigation */}
      <Dots total={slides.length} activeIndex={activeIndex} onSelect={scrollToSlide} />
    </div>
  );
}
