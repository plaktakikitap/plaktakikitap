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
      className="min-h-screen w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-[12px]"
    >
      <div className="h-full w-full">{children}</div>
    </motion.div>
  );
}
