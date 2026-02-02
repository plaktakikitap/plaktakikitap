"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export interface DeskNotebookMobileEntry {
  id: string;
  date: string;
  title: string | null;
  body: string | null;
}

interface DeskNotebookMobileProps {
  entries: DeskNotebookMobileEntry[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function excerpt(text: string | null, maxLen = 50): string {
  if (!text?.trim()) return "—";
  return text.trim().length <= maxLen ? text.trim() : text.trim().slice(0, maxLen) + "…";
}

export function DeskNotebookMobile({ entries }: DeskNotebookMobileProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="border-t border-[var(--card-border)]/50 px-4 py-8 md:hidden"
    >
      <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
        Son Günler
      </h3>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--muted)]">Henüz kayıt yok.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {entries.slice(0, 3).map((e) => (
            <li key={e.id}>
              <Link
                href={`/planner?date=${e.date}`}
                className="block rounded py-1.5"
              >
                <span className="text-[10px] text-[var(--muted)]">
                  {formatDate(e.date)}
                </span>
                <p className="text-sm text-[var(--foreground)]">
                  {e.title || excerpt(e.body)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/planner"
        className="mt-4 inline-block text-sm text-[var(--muted)] underline-offset-2 hover:underline"
      >
        Ajandaya git →
      </Link>
    </motion.section>
  );
}
