"use client";

import { motion } from "framer-motion";
import type { TranslationVolunteerProjectRow } from "@/types/database";
import { ExternalLink, Instagram } from "lucide-react";

export function TranslationsVolunteerSection({
  projects,
}: {
  projects: TranslationVolunteerProjectRow[];
}) {
  if (projects.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mb-14"
    >
      <h2 className="font-editorial text-xl font-medium text-[var(--foreground)] sm:text-2xl mb-6">
        Gönüllü Çeviri Projeleri
      </h2>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        {projects.map((project, i) => (
          <motion.article
            key={project.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i }}
            className="group rounded-xl border border-amber-400/15 bg-white/5 backdrop-blur-sm p-5 sm:p-6 transition-all duration-200 hover:border-amber-400/30 hover:shadow-[0_0_30px_-8px_rgba(212,182,90,0.18)]"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-editorial text-lg font-medium text-[var(--foreground)]">
                {project.org_name}
              </h3>
              {project.years && (
                <span className="text-sm text-[var(--muted)] shrink-0">
                  {project.years}
                </span>
              )}
            </div>
            {project.role_title && (
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                {project.role_title}
              </p>
            )}
            {project.description?.trim() && (
              <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
                {project.description}
              </p>
            )}
            {project.highlights && project.highlights.length > 0 && (
              <ul className="mt-3 space-y-1">
                {project.highlights.map((h, j) => (
                  <li key={j} className="flex gap-2 text-sm text-[var(--foreground)]">
                    <span className="text-amber-500/80">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {project.website_url && (
                <a
                  href={project.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-300 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Website
                </a>
              )}
              {project.instagram_url && (
                <a
                  href={project.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-300 hover:underline"
                >
                  <Instagram className="h-3.5 w-3.5" />
                  Instagram
                </a>
              )}
              {project.x_url && (
                <a
                  href={project.x_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-300 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  X
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}
