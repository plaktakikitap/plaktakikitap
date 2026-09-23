"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const MessyBulletJournal = dynamic(
  () => import("@/components/planner/MessyBulletJournal"),
  {
    ssr: false,
    loading: () => (
      <div
        className="mx-auto flex h-[min(70vh,520px)] max-w-4xl items-center justify-center text-[0.7rem] tracking-[0.2em] text-ink-muted/50"
        aria-hidden
      >
        ajanda yükleniyor…
      </div>
    ),
  }
);

/** Ajanda yakına gelene kadar mount etme — onlarca API isteğini erteler. */
export function LazyAjanda() {
  const ref = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    const el = ref.current;
    if (!el) return;

    const reveal = () => setReady(true);

    // Zaten görünürse hemen yükle (IO kaçırmasın)
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 280 && rect.bottom > -280) {
      reveal();
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          reveal();
          io.disconnect();
        }
      },
      { rootMargin: "280px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ready]);

  return (
    <section id="ajanda" ref={ref} className="scroll-mt-6">
      {ready ? (
        <MessyBulletJournal />
      ) : (
        <div className="h-[min(70vh,520px)]" aria-hidden />
      )}
    </section>
  );
}
