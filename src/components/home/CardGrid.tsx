"use client";

import { HomeCard } from "./HomeCard";
import type { HomeCardData } from "./HomeCard";

interface CardGridProps {
  cards: HomeCardData[];
}

export function CardGrid({ cards }: CardGridProps) {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <HomeCard key={card.id} data={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
