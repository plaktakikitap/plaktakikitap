"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { WorksItem } from "@/types/works";

interface ExperienceCardsProps {
  items: WorksItem[];
}

export function ExperienceCards({ items }: ExperienceCardsProps) {
  const list = items.filter((i) => i.type === "experience" || i.type === "project");
  if (list.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="mb-6 font-editorial text-2xl font-medium text-white sm:text-3xl">
        Deneyim & Projeler
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {list.map((item) => (
          <ExperienceCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function ExperienceCard({ item }: { item: WorksItem }) {
  const role = item.meta && typeof item.meta.role === "string" ? item.meta.role : null;
  const metrics = item.meta && typeof item.meta.metrics === "string" ? item.meta.metrics : null;
  const linkUrl = item.url || item.external_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-amber-400/25 hover:bg-white/8"
    >
      <h3 className="font-editorial text-xl font-semibold text-white">{item.title}</h3>
      {role && <p className="mt-1 text-sm text-amber-200/90">{role}</p>}
      {(item.description || item.subtitle) && (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-white/75">
          {item.description || item.subtitle}
        </p>
      )}
      {metrics && (
        <p className="mt-2 text-xs text-white/55">{metrics}</p>
      )}
      {linkUrl && (
        <Link
          href={linkUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20"
        >
          İncele
          <ExternalLink className="h-4 w-4" />
        </Link>
      )}
    </motion.div>
  );
}
