"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import type { WorksItem } from "@/types/works";
import { BrushStrokeUnderline } from "./BrushStrokeUnderline";

interface SoftwareCardsProps {
  items: WorksItem[];
}

export function SoftwareCards({ items }: SoftwareCardsProps) {
  if (items.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="mb-6 w-fit max-w-full">
        <h2 className="font-editorial text-2xl font-bold text-ink sm:text-3xl">
          Yazılım & Web Projeleri
        </h2>
        <BrushStrokeUnderline />
      </div>
      <div className="grid items-stretch gap-4 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => (
          <SoftwareCard key={item.id} item={item} />
        ))}
        <ThisSiteJokeCard />
      </div>
    </section>
  );
}

function ThisSiteJokeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full min-h-[10rem] items-center justify-center overflow-hidden rounded-2xl border border-ink/10 bg-ink/5 px-5 py-8 text-center backdrop-blur-sm"
    >
      <p className="font-editorial text-base font-medium leading-relaxed text-ink/80 sm:text-lg">
        Ve tabii ki bu site, plaktakikitap.com’da kendi yazımımdır! :)
      </p>
    </motion.div>
  );
}

function SoftwareCard({ item }: { item: WorksItem }) {
  const stack = Array.isArray(item.meta?.stack)
    ? (item.meta.stack as string[])
    : [];
  const githubUrl =
    item.meta && typeof item.meta.github_url === "string"
      ? item.meta.github_url
      : null;
  const siteUrl = item.url?.trim() || "";
  const liveUrl = siteUrl || item.external_url;
  const screenshotUrl = readScreenshotUrl(item);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-ink/5 backdrop-blur-sm transition-all hover:border-amber-400/25 hover:bg-white/8"
    >
      {siteUrl ? (
        <SitePreview url={siteUrl} screenshotUrl={screenshotUrl} />
      ) : null}

      <div className="flex shrink-0 flex-col px-4 pb-4 pt-3">
        <h3 className="font-editorial text-lg font-bold leading-snug text-ink">
          {item.title}
        </h3>
        {(item.description || item.subtitle) && (
          <p className="mt-2 text-sm leading-relaxed text-ink/75">
            {item.description || item.subtitle}
          </p>
        )}
        {stack.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {stack.map((s) => (
              <span
                key={s}
                className="rounded-md bg-ink/5 px-2 py-0.5 text-xs text-ink/80"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {liveUrl && (
            <Link
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm font-medium text-gold transition hover:bg-gold-soft"
            >
              <ExternalLink className="h-4 w-4" /> Siteye gitmek için tıklayın
            </Link>
          )}
          {githubUrl && (
            <Link
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-ink/20 bg-ink/5 px-3 py-2 text-sm font-medium text-ink/80 transition hover:bg-ink/5"
            >
              <Github className="h-4 w-4" /> GitHub
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SitePreview({
  url,
  screenshotUrl,
}: {
  url: string;
  screenshotUrl: string | null;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const domain = useMemo(() => readDomain(url), [url]);
  const src = useMemo(() => {
    if (screenshotUrl) return screenshotUrl;
    const absolute = toAbsoluteUrl(url);
    return `https://api.microlink.io/?url=${encodeURIComponent(absolute)}&screenshot=true&meta=false&embed=screenshot.url`;
  }, [screenshotUrl, url]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || failed) return;
    if (img.complete && img.naturalWidth > 0) setLoaded(true);
  }, [src, failed]);

  if (failed) {
    return (
      <div className="works-site-preview h-[160px] shrink-0" aria-hidden>
        <div className="works-site-preview-placeholder">{domain}</div>
      </div>
    );
  }

  return (
    <div className="works-site-preview h-[160px] shrink-0">
      {!loaded && <div className="works-site-preview-skeleton" aria-hidden />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={loaded ? "is-loaded" : undefined}
        onLoad={(event) => {
          if (event.currentTarget.naturalWidth > 0) setLoaded(true);
          else setFailed(true);
        }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function readScreenshotUrl(item: WorksItem): string | null {
  const raw = item.meta?.screenshot_url;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return null;
}

function toAbsoluteUrl(raw: string): string {
  const trimmed = raw.trim();
  try {
    return new URL(trimmed).toString();
  } catch {
    try {
      return new URL(`https://${trimmed}`).toString();
    } catch {
      return trimmed;
    }
  }
}

function readDomain(raw: string): string {
  try {
    return new URL(toAbsoluteUrl(raw)).hostname.replace(/^www\./, "");
  } catch {
    return raw.replace(/^https?:\/\//i, "").replace(/^www\./, "").split("/")[0] || raw;
  }
}
