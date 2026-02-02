"use client";

import { motion } from "framer-motion";

interface PageHeaderProps {
  layoutId: string;
  title: string;
  subtitle?: string;
}

export function PageHeader({ layoutId, title, subtitle }: PageHeaderProps) {
  return (
    <motion.header
      layoutId={layoutId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
      className="mb-8"
    >
      <h1 className="font-editorial text-3xl font-medium text-[var(--foreground)]">
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-[var(--muted)]">{subtitle}</p>}
    </motion.header>
  );
}
