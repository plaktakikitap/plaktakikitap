"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";

const ROOT_CLASS = "vinyl-cursor";

/** SPA geçişlerinde plak imlecinin kaybolmaması için html sınıfını korur. */
export function GlobalVinylCursor() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(pointer: fine)");

    const sync = () => {
      if (reduceMotion || !mq.matches) {
        root.classList.remove(ROOT_CLASS);
        return;
      }
      root.classList.add(ROOT_CLASS);
    };

    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      root.classList.remove(ROOT_CLASS);
    };
  }, [pathname, reduceMotion]);

  return null;
}
