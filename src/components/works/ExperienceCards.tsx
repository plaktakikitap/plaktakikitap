"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { WorksItem } from "@/types/works";
import { BrushStrokeUnderline } from "./BrushStrokeUnderline";

interface ExperienceCardsProps {
  items: WorksItem[];
}

export function ExperienceCards({ items }: ExperienceCardsProps) {
  const experiences = items.filter((i) => i.type === "experience");
  const projects = items.filter((i) => i.type === "project");
  const taksim = projects.find((p) => /taksim sesli kitabevi/i.test(p.title));
  const otherProjects = projects.filter((p) => p.id !== taksim?.id);
  if (experiences.length === 0 && projects.length === 0) return null;

  const pairWithTaksim = experiences.length > 0 && taksim;

  return (
    <section className="mb-16">
      <div className="mb-6 w-fit max-w-full">
        <h2 className="font-editorial text-2xl font-bold text-ink sm:text-3xl">
          Deneyim & Projeler
        </h2>
        <BrushStrokeUnderline />
      </div>
      {pairWithTaksim ? (
        <div className="mb-8 grid items-stretch gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            {experiences.map((item) => (
              <VolunteerCard key={item.id} item={item} fill />
            ))}
          </div>
          <ProjectCard item={taksim} fill />
        </div>
      ) : experiences.length > 0 ? (
        <div className="mb-8 flex max-w-md flex-col gap-2">
          {experiences.map((item) => (
            <VolunteerCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}
      {otherProjects.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {otherProjects.map((item) => (
            <ProjectCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function VolunteerCard({ item, fill }: { item: WorksItem; fill?: boolean }) {
  const org = item.subtitle || (typeof item.meta?.role === "string" ? item.meta.role : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-ink/10 bg-ink/5 px-4 py-3 backdrop-blur-sm transition-all hover:border-amber-400/25 hover:bg-white/8 ${fill ? "flex flex-1 flex-col justify-center" : ""}`}
    >
      <h3 className="font-editorial text-base font-bold leading-tight text-ink">
        {item.title}
      </h3>
      {org ? <p className="mt-0.5 text-xs text-ink/60">{org}</p> : null}
    </motion.div>
  );
}

function ProjectCard({ item, fill }: { item: WorksItem; fill?: boolean }) {
  const role = item.meta && typeof item.meta.role === "string" ? item.meta.role : null;
  const metrics = item.meta && typeof item.meta.metrics === "string" ? item.meta.metrics : null;
  const linkUrl = item.url || item.external_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col rounded-2xl border border-ink/10 bg-ink/5 p-6 backdrop-blur-sm transition-all hover:border-amber-400/25 hover:bg-white/8 ${fill ? "h-full" : ""}`}
    >
      <h3 className="font-editorial text-xl font-bold text-ink">{item.title}</h3>
      {role && <p className="mt-1 text-sm text-gold/90">{role}</p>}
      {(item.description || item.subtitle) && (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/75">
          {item.description || item.subtitle}
        </p>
      )}
      {metrics && (
        <p className="mt-2 text-xs text-ink/55">{metrics}</p>
      )}
      {linkUrl && (
        <Link
          href={linkUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-auto inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-sm font-medium text-gold transition hover:bg-gold-soft"
        >
          İncele
          <ExternalLink className="h-4 w-4" />
        </Link>
      )}
    </motion.div>
  );
}
