"use client";

import { DeskCard } from "./DeskCard";
import type { DeskCardData } from "./DeskCard";

/** Asymmetrical positions — like papers on a desk. top/left in %, rotate in deg. */
const CARD_POSITIONS = [
  { top: "18%", left: "8%", rotate: -0.5 },
  { top: "22%", left: "32%", rotate: 0.8 },
  { top: "26%", left: "56%", rotate: -0.4 },
  { top: "42%", left: "12%", rotate: 0.5 },
  { top: "46%", left: "48%", rotate: -0.7 },
  { top: "52%", left: "68%", rotate: 0.3 },
];

interface DeskSurfaceProps {
  cards: DeskCardData[];
}

export function DeskSurface({ cards }: DeskSurfaceProps) {
  return (
    <div className="relative min-h-[60vh] hidden md:block">
      {cards.map((card, i) => (
        <DeskCard
          key={card.id}
          data={card}
          index={i}
          position={CARD_POSITIONS[i] ?? { top: "40%", left: "30%", rotate: 0 }}
        />
      ))}
    </div>
  );
}
