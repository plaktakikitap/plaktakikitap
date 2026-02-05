"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import type { WorksItem } from "@/types/works";

interface CVTimelineProps {
  items: WorksItem[];
  cvDownloadUrl: string;
}

export function CVTimeline({ items, cvDownloadUrl }: CVTimelineProps) {
  const roles = items.filter((i) => i.type === "cv_role");

  return (
    <section className="mb-12">
      <h2 className="mb-6 font-editorial text-2xl font-medium text-white sm:text-3xl">
        Özgeçmiş
      </h2>

      {roles.length > 0 && (
        <div className="relative mb-10">
          <div
            className="absolute left-3 top-0 bottom-0 w-px sm:left-4"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(212,175,55,0.25) 15%, rgba(212,175,55,0.25) 85%, transparent)",
            }}
          />
          <ul className="space-y-6">
            {roles.map((item) => {
              const start = item.meta?.start_year ?? item.meta?.year;
              const end = item.meta?.end_year;
              const org =
                typeof item.meta?.org === "string"
                  ? item.meta.org
                  : item.subtitle ?? "";
              const period =
                start != null && end != null
                  ? `${start} – ${end}`
                  : start != null
                    ? String(start)
                    : item.subtitle ?? "";
              return (
                <li key={item.id} className="relative flex gap-4 pl-10 sm:pl-12">
                  <span
                    className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-amber-400/80"
                    aria-hidden
                  />
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    {org ? <p className="text-sm text-amber-200/90">{org}</p> : null}
                    <p className="text-xs text-white/60">{period}</p>
                    {item.description && (
                      <p className="mt-1 text-sm leading-relaxed text-white/70">
                        {item.description}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {cvDownloadUrl && (
        <Link
          href={cvDownloadUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-400/15 px-5 py-3 font-medium text-amber-100 transition hover:bg-amber-400/25 hover:border-amber-400/70"
        >
          <Download className="h-5 w-5" />
          CV İndir
        </Link>
      )}

      {roles.length === 0 && !cvDownloadUrl && (
        <p className="text-sm text-white/50">Henüz özgeçmiş bilgisi eklenmedi.</p>
      )}
    </section>
  );
}
