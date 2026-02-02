"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export interface PlannerPreviewEntry {
  id: string;
  date: string;
  title: string | null;
  body: string | null;
}

interface PlannerPreviewProps {
  entries: PlannerPreviewEntry[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

function excerpt(text: string | null, maxLen = 60): string {
  if (!text?.trim()) return "—";
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen).trim() + "…";
}

export function PlannerPreview({ entries }: PlannerPreviewProps) {
  if (entries.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border-t border-[var(--card-border)]/40 px-4 py-16"
      >
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-lg font-medium text-[var(--foreground)]">
            Son Günler
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Henüz kayıt yok.
          </p>
          <Link
            href="/planner"
            className="mt-4 inline-block text-sm text-[var(--muted)] underline-offset-2 hover:underline"
          >
            Ajandaya git →
          </Link>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="border-t border-[var(--card-border)]/40 px-4 py-16"
    >
      <div className="mx-auto max-w-2xl">
        <h2 className="font-display text-lg font-medium text-[var(--foreground)]">
          Son Günler
        </h2>
        <ul className="mt-4 space-y-3">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/planner?date=${entry.date}`}
                className="block rounded-lg border border-transparent py-2 transition-colors hover:border-[var(--card-border)] hover:bg-[var(--card)]/50"
              >
                <span className="text-xs uppercase tracking-wider text-[var(--muted)]">
                  {formatDate(entry.date)}
                </span>
                <p className="mt-0.5 text-sm text-[var(--foreground)]">
                  {entry.title || excerpt(entry.body)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/planner"
          className="mt-6 inline-block text-sm text-[var(--muted)] underline-offset-2 hover:underline"
        >
          Ajandaya git →
        </Link>
      </div>
    </motion.section>
  );
}
