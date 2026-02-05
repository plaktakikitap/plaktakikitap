"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import type { WorksItem } from "@/types/works";

interface SoftwareCardsProps {
  items: WorksItem[];
}

export function SoftwareCards({ items }: SoftwareCardsProps) {
  if (items.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="mb-6 font-editorial text-2xl font-medium text-white sm:text-3xl">
        Yazılım & Web Projeleri
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <SoftwareCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function SoftwareCard({ item }: { item: WorksItem }) {
  const stack = Array.isArray(item.meta?.stack) ? (item.meta.stack as string[]) : [];
  const githubUrl = item.meta && typeof item.meta.github_url === "string" ? item.meta.github_url : null;
  const liveUrl = item.url || item.external_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-amber-400/25 hover:bg-white/8"
    >
      <h3 className="font-editorial text-xl font-semibold text-white">{item.title}</h3>
      {(item.description || item.subtitle) && (
        <p className="mt-2 text-sm leading-relaxed text-white/75">
          {item.description || item.subtitle}
        </p>
      )}
      {stack.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {stack.map((s) => (
            <span
              key={s}
              className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/80"
            >
              {s}
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {liveUrl && (
          <Link
            href={liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20"
          >
            <ExternalLink className="h-4 w-4" /> Canlı
          </Link>
        )}
        {githubUrl && (
          <Link
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
          >
            <Github className="h-4 w-4" /> GitHub
          </Link>
        )}
      </div>
    </motion.div>
  );
}
