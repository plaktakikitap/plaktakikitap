"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export interface DeskNotebookEntry {
  id: string;
  date: string;
  title: string | null;
  body: string | null;
}

interface DeskNotebookProps {
  entries: DeskNotebookEntry[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function excerpt(text: string | null, maxLen = 45): string {
  if (!text?.trim()) return "—";
  const t = text.trim();
  return t.length <= maxLen ? t : t.slice(0, maxLen).trim() + "…";
}

export function DeskNotebook({ entries }: DeskNotebookProps) {
  const displayEntries = entries.slice(0, 3);

  return (
    <motion.aside
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="absolute right-4 bottom-4 z-10 w-56 md:right-8 md:bottom-8 md:w-64"
    >
      <Link
        href="/planner"
        className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/20 focus-visible:ring-offset-2 rounded-sm"
      >
        {/* Half-open notebook: soft shadow, left edge like binding */}
        <div
          className="rounded-sm bg-[#faf8f5] p-4"
          style={{
            boxShadow: "2px 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)",
            transform: "rotate(-1deg)",
          }}
        >
          <div className="border-l-2 border-[var(--muted)]/30 pl-3">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Son Günler
            </h3>
            {displayEntries.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--muted)]">—</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {displayEntries.map((e) => (
                  <li key={e.id}>
                    <span className="text-[10px] text-[var(--muted)]">
                      {formatDate(e.date)}
                    </span>
                    <p className="text-sm text-[var(--foreground)]/90">
                      {e.title || excerpt(e.body)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <span className="mt-3 inline-block text-xs text-[var(--muted)] underline-offset-2 hover:underline">
              Ajandaya git →
            </span>
          </div>
        </div>
      </Link>
    </motion.aside>
  );
}
