"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { WorksItem } from "@/types/works";

const CARD_MIN_HEIGHT = 320;

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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <BadgeItem key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}

function BadgeItem({ item, index }: { item: WorksItem; index: number }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const issuer = item.meta && typeof item.meta.issuer === "string" ? item.meta.issuer : null;
  const year = item.meta && typeof item.meta.year !== "undefined" ? String(item.meta.year) : null;
  const tooltip = [issuer, year].filter(Boolean).join(" · ") || item.title;
  const linkUrl = item.url || item.external_url;
  const description = item.description?.trim() ?? "";

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{
        boxShadow: "0 0 20px rgba(212,175,55,0.35), 0 0 40px rgba(212,175,55,0.15)",
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="relative flex h-full min-h-[320px] flex-col rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm overflow-hidden"
    >
      {/* Görsel alanı: dikey ve yatay görseller aynı kutuda, okunaklı boyutta */}
      <div className="flex h-44 w-full shrink-0 items-center justify-center rounded-t-2xl bg-white/5 p-3">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="max-h-full max-w-full object-contain"
            style={{ maxHeight: "11rem", maxWidth: "100%" }}
          />
        ) : (
          <div className="flex h-full min-h-[8rem] w-full items-center justify-center rounded-lg bg-amber-500/10 text-4xl">
            🏆
          </div>
        )}
      </div>

      {/* Başlık + açıklama: sabit yükseklik, açıklama üç nokta ile kısaltılır */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-medium text-white">
          {item.title}
        </h3>
        {description ? (
          <p
            className="line-clamp-3 text-sm text-white/80"
            title={description}
          >
            {description}
          </p>
        ) : null}
      </div>

      {showTooltip && tooltip && (
        <span className="absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-xs text-white whitespace-nowrap">
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
        className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050A14]"
      >
        {content}
      </a>
    );
  }
  return <div className="h-full">{content}</div>;
}
