"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { WorksItem } from "@/types/works";

interface BadgeCloudProps {
  items: WorksItem[];
}

export function BadgeCloud({ items }: BadgeCloudProps) {
  if (items.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="mb-6 font-editorial text-2xl font-medium text-white sm:text-3xl">
        Sertifikalar
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-6">
        {items.map((item) => (
          <BadgeItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function BadgeItem({ item }: { item: WorksItem }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const issuer = item.meta && typeof item.meta.issuer === "string" ? item.meta.issuer : null;
  const year = item.meta && typeof item.meta.year !== "undefined" ? String(item.meta.year) : null;
  const tooltip = [issuer, year].filter(Boolean).join(" · ") || item.title;
  const linkUrl = item.url || item.external_url;

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{
        scale: 1.08,
        boxShadow: "0 0 20px rgba(212,175,55,0.35), 0 0 40px rgba(212,175,55,0.15)",
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="relative flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm"
    >
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.title}
          className="h-14 w-14 object-contain sm:h-16 sm:w-16"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-2xl sm:h-16 sm:w-16">
          🏆
        </div>
      )}
      <span className="max-w-[100px] text-center text-xs font-medium text-white/90">
        {item.title}
      </span>
      {showTooltip && tooltip && (
        <span className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-xs text-white whitespace-nowrap">
          {tooltip}
        </span>
      )}
    </motion.div>
  );

  if (linkUrl) {
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel="noreferrer"
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050A14]"
      >
        {content}
      </a>
    );
  }
  return <div>{content}</div>;
}
