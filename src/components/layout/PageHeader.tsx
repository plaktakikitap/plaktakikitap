"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  layoutId: string;
  title: string;
  subtitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function PageHeader({ layoutId, title, subtitle, titleClassName, subtitleClassName }: PageHeaderProps) {
  return (
    <motion.header
      layoutId={layoutId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
      className="mb-6 sm:mb-8"
    >
      <h1 className={cn("font-editorial text-2xl font-medium text-[var(--foreground)] sm:text-3xl", titleClassName)}>
        {title}
      </h1>
      {subtitle && (
        <p className={cn("mt-1 text-[var(--muted)]", subtitleClassName)}>
          {subtitle}
        </p>
      )}
    </motion.header>
  );
}
