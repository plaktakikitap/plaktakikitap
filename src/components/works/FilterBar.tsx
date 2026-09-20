"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export type WorksFilter =
  | "all"
  | "art"
  | "project"
  | "certificate"
  | "software";

const FILTERS: { value: WorksFilter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "art", label: "Resim" },
  { value: "project", label: "Projeler" },
  { value: "certificate", label: "Sertifika" },
  { value: "software", label: "Yazılım" },
];

interface FilterBarProps {
  value: WorksFilter;
  onChange: (v: WorksFilter) => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label="Filtre"
    >
      {FILTERS.map((f) => {
        const active = value === f.value;
        return (
          <motion.button
            key={f.value}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(f.value)}
            className={`works-filter-btn ${active ? "is-active" : ""}`}
            aria-pressed={active}
          >
            {f.label}
          </motion.button>
        );
      })}
      <Link href="/portfolyo" className="works-filter-btn">
        Portfolyo
      </Link>
    </nav>
  );
}

export function filterItemsByType<T extends { type: string }>(
  items: T[],
  filter: WorksFilter
): T[] {
  if (filter === "all") return items;
  if (filter === "project")
    return items.filter(
      (i) => i.type === "experience" || i.type === "project"
    );
  return items.filter((i) => i.type === filter);
}
