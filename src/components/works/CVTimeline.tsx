"use client";

import { Download, Mail } from "lucide-react";
import type { WorksItem } from "@/types/works";

const CV_MAIL = "plaktakikitap@gmail.com";

interface CVTimelineProps {
  items: WorksItem[];
  cvDownloadUrl: string;
}

export function CVTimeline({ items, cvDownloadUrl }: CVTimelineProps) {
  const roles = items.filter((i) => i.type === "cv_role");

  return (
    <section className="mb-12">
      <h2 className="mb-6 font-editorial text-2xl font-bold text-ink sm:text-3xl">
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
                    <p className="font-medium text-ink">{item.title}</p>
                    {org ? <p className="text-sm text-ink/70">{org}</p> : null}
                    <p className="text-xs text-ink/50">{period}</p>
                    {item.description && (
                      <p className="mt-1 text-sm leading-relaxed text-ink/70">
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

      <div className="flex flex-wrap items-center gap-3">
        {cvDownloadUrl ? (
          <a
            href={cvDownloadUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-5 py-3 font-medium text-gold transition hover:bg-gold-soft"
          >
            <Download className="h-5 w-5" />
            CV&apos;yi indir
          </a>
        ) : null}
        <a
          href={`mailto:${CV_MAIL}`}
          className="inline-flex items-center gap-2 rounded-xl border border-ink/20 bg-ink/5 px-5 py-3 font-medium text-ink transition hover:border-ink/35 hover:bg-ink/10"
        >
          <Mail className="h-5 w-5" />
          CV&apos;mi istemek için bana ulaşınız.
        </a>
      </div>
    </section>
  );
}
