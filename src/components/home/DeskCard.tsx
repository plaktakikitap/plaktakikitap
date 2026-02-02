"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export interface DeskCardData {
  id: string;
  title: string;
  href: string;
  preview?: React.ReactNode;
}

interface DeskCardProps {
  data: DeskCardData;
  index: number;
  position: { top: string; left: string; rotate: number };
}

export function DeskCard({ data, index, position }: DeskCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      className="absolute w-40 md:w-48 lg:w-52"
      style={{
        top: position.top,
        left: position.left,
        transform: `rotate(${position.rotate}deg)`,
      }}
    >
      <Link
        href={data.href}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/20 focus-visible:ring-offset-2 rounded-sm"
      >
        <motion.div
          className="group rounded-sm bg-white/90 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-[1px]"
          initial={false}
          whileHover={{
            scale: 1.03,
            rotate: position.rotate + (index % 2 === 0 ? 1 : -1),
            zIndex: 20,
            boxShadow: "0 12px 32px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
            transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
          }}
        >
          <h2 className="font-display text-base font-medium text-[var(--foreground)] md:text-lg">
            {data.title}
          </h2>
          {data.preview && (
            <div className="mt-2 text-sm text-[var(--muted)] line-clamp-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {data.preview}
            </div>
          )}
        </motion.div>
      </Link>
    </motion.article>
  );
}
