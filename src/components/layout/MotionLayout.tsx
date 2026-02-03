"use client";

import { usePathname } from "next/navigation";
import { LayoutGroup, AnimatePresence, motion } from "framer-motion";

/** Intro → Home morph: seçim yapıldığında ana sayfa akışkan biçimde açılır */
const MORPH_TRANSITION = { type: "spring" as const, damping: 30, stiffness: 260 };

export function MotionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isIntro = pathname === "/";
  const isHome = pathname === "/home";

  return (
    <LayoutGroup>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={pathname}
          initial={
            isHome
              ? { opacity: 0, scale: 0.97, filter: "blur(6px)" }
              : { opacity: 0 }
          }
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={
            isIntro
              ? { opacity: 0, scale: 1.04, filter: "blur(4px)" }
              : { opacity: 0, scale: 0.99 }
          }
          transition={MORPH_TRANSITION}
          className="min-h-full w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </LayoutGroup>
  );
}
