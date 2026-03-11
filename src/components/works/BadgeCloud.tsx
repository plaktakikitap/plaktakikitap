"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WorksItem } from "@/types/works";
import { CertificateDetailModal } from "./CertificateDetailModal";

interface BadgeCloudProps {
  items: WorksItem[];
}

export function BadgeCloud({ items }: BadgeCloudProps) {
  const [selectedItem, setSelectedItem] = useState<WorksItem | null>(null);

  if (items.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="mb-6 font-editorial text-2xl font-medium text-white sm:text-3xl">
        Sertifikalar
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <BadgeItem
            key={item.id}
            item={item}
            index={i}
            onSelect={() => setSelectedItem(item)}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <CertificateDetailModal
            key={selectedItem.id}
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function BadgeItem({
  item,
  index,
  onSelect,
}: {
  item: WorksItem;
  index: number;
  onSelect: () => void;
}) {
  const issuer = item.meta && typeof item.meta.issuer === "string" ? item.meta.issuer : null;
  const year = item.meta && typeof item.meta.year !== "undefined" ? String(item.meta.year) : null;
  const tooltip = [issuer, year].filter(Boolean).join(" · ") || item.title;
  const description = item.description?.trim() ?? "";

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{
        boxShadow: "0 0 20px rgba(212,175,55,0.35), 0 0 40px rgba(212,175,55,0.15)",
      }}
      onClick={onSelect}
      className="relative flex h-full min-h-[320px] w-full flex-col rounded-2xl border border-white/15 bg-white/5 text-left backdrop-blur-sm overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050A14]"
    >
      {/* Görsel alanı */}
      <div className="flex h-44 w-full shrink-0 items-center justify-center rounded-t-2xl bg-white/5 p-3">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt=""
            className="max-h-full max-w-full object-contain"
            style={{ maxHeight: "11rem", maxWidth: "100%" }}
          />
        ) : (
          <div className="flex h-full min-h-[8rem] w-full items-center justify-center rounded-lg bg-amber-500/10 text-4xl">
            🏆
          </div>
        )}
      </div>

      {/* Başlık + açıklama: başlık altında açıklama daha küçük ve gri */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-medium text-white">
          {item.title}
        </h3>
        {description ? (
          <p
            className="line-clamp-3 text-xs text-white/50"
            title={description}
          >
            {description}
          </p>
        ) : null}
      </div>

      {tooltip && (
        <span className="sr-only">
          {tooltip}. Detay için tıklayın.
        </span>
      )}
    </motion.button>
  );
}
