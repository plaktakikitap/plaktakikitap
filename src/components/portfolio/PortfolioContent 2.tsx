"use client";

import { useMemo, useState } from "react";
import type { PortfolioItem } from "@/types/database";

const CATEGORY_ORDER = ["afiş", "sosyal medya", "fotoğraf", "video"] as const;

interface PortfolioContentProps {
  items: PortfolioItem[];
}

export function PortfolioContent({ items }: PortfolioContentProps) {
  const [client, setClient] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const clients = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      const value = item.client?.trim();
      if (value) set.add(value);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [items]);

  const categories = useMemo(() => {
    const fromData = new Set<string>();
    items.forEach((item) => {
      const value = item.category?.trim();
      if (value) fromData.add(value);
    });
    const extras = Array.from(fromData)
      .filter((name) => !(CATEGORY_ORDER as readonly string[]).includes(name))
      .sort((a, b) => a.localeCompare(b, "tr"));
    return [...CATEGORY_ORDER, ...extras];
  }, [items]);

  const visible = useMemo(() => {
    return items.filter((item) => {
      if (!item.image_url?.trim()) return false;
      if (client && item.client?.trim() !== client) return false;
      if (category && item.category?.trim() !== category) return false;
      return true;
    });
  }, [items, client, category]);

  const hasAnyImages = items.some((item) => item.image_url?.trim());

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 text-center">
        <h1
          className="font-editorial italic font-normal"
          style={{ fontSize: "3rem", color: "#2A2018", lineHeight: 1.15 }}
        >
          portfolyo
        </h1>
      </header>

      {clients.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
          <FilterChip
            label="Tümü"
            active={client === null}
            onClick={() => setClient(null)}
          />
          {clients.map((name) => (
            <FilterChip
              key={name}
              label={name}
              active={client === name}
              onClick={() => setClient(client === name ? null : name)}
            />
          ))}
        </div>
      ) : null}

      <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
        <FilterChip
          label="Tümü"
          active={category === null}
          onClick={() => setCategory(null)}
        />
        {categories.map((name) => (
          <FilterChip
            key={name}
            label={name}
            active={category === name}
            onClick={() => setCategory(category === name ? null : name)}
          />
        ))}
      </div>

      {!hasAnyImages ? (
        <p className="py-24 text-center text-sm" style={{ color: "#8B7B6B" }}>
          yakında eklenecek
        </p>
      ) : visible.length === 0 ? (
        <p className="py-24 text-center text-sm" style={{ color: "#8B7B6B" }}>
          yakında eklenecek
        </p>
      ) : (
        <div className="portfolio-masonry">
          {visible.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`works-filter-btn ${active ? "is-active" : ""}`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const src = item.image_url?.trim() ?? "";

  return (
    <article className="portfolio-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={item.title} loading="lazy" decoding="async" />
      <div className="portfolio-card-overlay">
        <p className="portfolio-card-title">{item.title}</p>
        {item.client ? <p className="portfolio-card-client">{item.client}</p> : null}
      </div>
    </article>
  );
}
