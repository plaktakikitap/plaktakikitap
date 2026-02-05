"use client";

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
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Filtre">
      {FILTERS.map((f) => (
        <motion.button
          key={f.value}
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(f.value)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            value === f.value
              ? "bg-white/15 text-white shadow-inner"
              : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90"
          }`}
        >
          {f.label}
        </motion.button>
      ))}
    </nav>
  );
}

export function filterItemsByType<T extends { type: string }>(
  items: T[],
  filter: WorksFilter
): T[] {
  if (filter === "all") return items;
  if (filter === "project") return items.filter((i) => i.type === "experience" || i.type === "project");
  return items.filter((i) => i.type === filter);
}
