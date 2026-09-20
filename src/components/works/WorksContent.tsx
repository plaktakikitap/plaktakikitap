"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { WorksItem } from "@/types/works";
import { FilterBar, filterItemsByType, type WorksFilter } from "./FilterBar";
import { YouTubeGallery } from "./YouTubeGallery";
import { ArtPhotoGrid } from "./ArtPhotoGrid";
import { ExperienceCards } from "./ExperienceCards";
import { SoftwareCards } from "./SoftwareCards";
import { BadgeCloud } from "./BadgeCloud";
import { CVTimeline } from "./CVTimeline";

interface WorksContentProps {
  items: WorksItem[];
  cvDownloadUrl: string;
}

export function WorksContent({ items, cvDownloadUrl }: WorksContentProps) {
  const [filter, setFilter] = useState<WorksFilter>("all");
  const filtered = useMemo(
    () => filterItemsByType(items, filter),
    [items, filter]
  );

  const youtube = useMemo(() => filtered.filter((i) => i.type === "youtube"), [filtered]);
  const artPhoto = useMemo(
    () => filtered.filter((i) => i.type === "art" || i.type === "photo"),
    [filtered]
  );
  const experienceProject = useMemo(
    () => filtered.filter((i) => i.type === "experience" || i.type === "project"),
    [filtered]
  );
  const software = useMemo(() => filtered.filter((i) => i.type === "software"), [filtered]);
  const certificate = useMemo(() => filtered.filter((i) => i.type === "certificate"), [filtered]);
  const cvRoles = useMemo(() => items.filter((i) => i.type === "cv_role"), [items]);

  const featured = useMemo(() => items.filter((i) => i.is_featured), [items]);
  const showFeatured = featured.length > 0 && filter === "all";

  const hasAny = filtered.length > 0 || (filter === "all" && cvRoles.length > 0);

  return (
    <div className="works-page" data-category={filter}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="font-editorial text-3xl font-semibold text-ink sm:text-4xl">
          Bazı Projelerim
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Videolar, sanat, projeler ve sertifikalar
        </p>
        <p className="mt-3">
          <Link
            href="/portfolyo"
            className="text-sm font-medium text-gold underline-offset-4 transition hover:underline"
          >
            Portfolyo →
          </Link>
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="mb-10"
      >
        <FilterBar value={filter} onChange={setFilter} />
      </motion.div>

      {showFeatured && (
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="mb-4 font-editorial text-lg font-medium text-ink/90">
            Öne çıkanlar
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-amber-400/20 bg-ink/5 px-4 py-3 text-sm text-ink/90"
              >
                {item.title}
                {item.type === "youtube" && " (Video)"}
                {item.type === "certificate" && " (Sertifika)"}
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {!hasAny && filter !== "all" && (
        <p className="py-12 text-center text-sm text-ink/50">
          Bu filtrede içerik bulunamadı.
        </p>
      )}

      {filter === "all" ? <YouTubeGallery items={youtube} /> : null}
      {filter === "all" || filter === "art" ? (
        <ArtPhotoGrid items={artPhoto} />
      ) : null}
      {filter === "all" || filter === "project" ? (
        <ExperienceCards items={experienceProject} />
      ) : null}
      {filter === "all" || filter === "software" ? <SoftwareCards items={software} /> : null}
      {filter === "all" || filter === "certificate" ? <BadgeCloud items={certificate} /> : null}
      {filter === "all" ? <CVTimeline items={cvRoles} cvDownloadUrl={cvDownloadUrl} /> : null}
      </div>
    </div>
  );
}
