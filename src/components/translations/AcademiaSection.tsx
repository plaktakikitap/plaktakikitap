"use client";

import { motion } from "framer-motion";
import type { TranslationAcademia } from "@/lib/db/queries";
import { GraduationCap, ExternalLink } from "lucide-react";

interface AcademiaSectionProps {
  data: TranslationAcademia | null;
}

export function AcademiaSection({ data }: AcademiaSectionProps) {
  if (!data || (!data.profile_url.trim() && data.projects.length === 0))
    return null;

  return (
    <section className="mb-12">
      <h2 className="mb-6 font-editorial text-xl font-medium text-[var(--foreground)] sm:text-2xl">
        Academia
      </h2>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/30 px-6 py-6 backdrop-blur-sm">
        {data.profile_url.trim() && (
          <a
            href={data.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-6 flex items-center gap-3 text-[var(--foreground)] transition hover:text-[var(--accent)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="font-medium">Academia.edu</span>
            <ExternalLink className="h-4 w-4 shrink-0 opacity-60" />
          </a>
        )}
        {data.projects.length > 0 && (
          <ul className="space-y-2">
            {data.projects.map((p, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-2 border-b border-[var(--card-border)]/50 py-2 last:border-0"
              >
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center gap-2 text-sm text-[var(--foreground)] transition hover:text-[var(--accent)]"
                >
                  <span className="truncate">{p.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-50" />
                </a>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
