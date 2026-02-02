"use client";

import { usePathname } from "next/navigation";
import { LayoutGroup, AnimatePresence } from "framer-motion";

export function MotionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <LayoutGroup>
      <AnimatePresence mode="popLayout" initial={false}>
        <div key={pathname}>{children}</div>
      </AnimatePresence>
    </LayoutGroup>
  );
}
