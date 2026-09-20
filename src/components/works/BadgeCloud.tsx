"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
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
      <h2 className="mb-6 font-editorial text-2xl font-medium text-ink sm:text-3xl">
        Sertifikalar
      </h2>
      <div className="works-polaroid-grid">
        {items.map((item) => (
          <BadgeItem
            key={item.id}
            item={item}
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
  onSelect,
}: {
  item: WorksItem;
  onSelect: () => void;
}) {
  const issuer =
    item.meta && typeof item.meta.issuer === "string" ? item.meta.issuer : null;
  const year =
    item.meta && typeof item.meta.year !== "undefined"
      ? String(item.meta.year)
      : null;
  const metaLine = [issuer, year].filter(Boolean).join(" · ");
  const description = item.description?.trim() ?? "";
  const tooltip =
    [item.title, metaLine, description].filter(Boolean).join(". ") ||
    item.title;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="works-polaroid"
      title={tooltip}
      aria-label={`${item.title}${metaLine ? ` — ${metaLine}` : ""}. Detay için tıklayın.`}
    >
      <div className="works-polaroid-media">
        {item.image_url ? (
          <img src={item.image_url} alt="" />
        ) : (
          <span className="text-4xl" aria-hidden>
            🏆
          </span>
        )}
      </div>

      <div className="works-polaroid-caption">
        <h3 className="works-polaroid-title line-clamp-2">{item.title}</h3>
        {metaLine ? (
          <p className="works-polaroid-meta">{metaLine}</p>
        ) : description ? (
          <p className="works-polaroid-meta line-clamp-2">{description}</p>
        ) : null}
      </div>
    </button>
  );
}
