"use client";

import { motion } from "framer-motion";

type Props = { layoutId: string; children: React.ReactNode };

/**
 * Hedef sayfada layoutId morph geçişini tamamlar: ana sayfadaki kart
 * bu kapsayıcıya akışkan biçimde genişler.
 */
export function PageTransitionTarget({ layoutId, children }: Props) {
  return (
    <motion.div
      layoutId={layoutId}
      initial={false}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="page-shell min-h-screen w-full overflow-hidden rounded-t-2xl border-x border-t border-ink/10"
    >
      <div className="relative z-[1] h-full w-full">{children}</div>
    </motion.div>
  );
}
