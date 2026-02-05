"use client";

import { motion } from "framer-motion";
import type { TranslationVolunteer } from "@/lib/db/queries";
import { ExternalLink } from "lucide-react";

interface VolunteerSectionProps {
  data: TranslationVolunteer | null;
}

export function VolunteerSection({ data }: VolunteerSectionProps) {
  if (!data?.projects?.length) return null;

  return (
    <section className="mb-12">
      <h2 className="mb-6 font-editorial text-xl font-medium text-[var(--foreground)] sm:text-2xl">
        Volunteer Projects
      </h2>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        {data.projects.map((p, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="group overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 shadow-sm transition hover:border-[var(--accent)]/25 hover:shadow-md"
          >
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6"
            >
              <h3 className="font-editorial text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)]">
                {p.title}
              </h3>
              {p.description?.trim() && (
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {p.description}
                </p>
              )}
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)]">
                <span>Bağlantı</span>
                <ExternalLink className="h-4 w-4" />
              </span>
            </a>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
