"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export type SatelliteIconName = "book" | "music" | "camera" | "spark";

export type SatelliteCardItem = {
  id: string;
  label: string;
  icon: SatelliteIconName;
  rotate: number;
  offsetX: number;
  offsetY: number;
  color: string;
};

export const DEFAULT_SATELLITES: SatelliteCardItem[] = [
  {
    id: "reading",
    label: "Şu an okuyorum",
    icon: "book",
    rotate: -14,
    offsetX: -190,
    offsetY: -70,
    color: "#6b2c2c",
  },
  {
    id: "spotify",
    label: "Son dinlediğim",
    icon: "music",
    rotate: 10,
    offsetX: 185,
    offsetY: -95,
    color: "#2c4a3e",
  },
  {
    id: "photo",
    label: "Çektiğim kareler",
    icon: "camera",
    rotate: -8,
    offsetX: -210,
    offsetY: 110,
    color: "#2c3a4a",
  },
  {
    id: "project",
    label: "Üzerinde çalıştığım",
    icon: "spark",
    rotate: 12,
    offsetX: 205,
    offsetY: 95,
    color: "#4a3a2c",
  },
];

function SatelliteIcon({ name }: { name: SatelliteIconName }) {
  const icons: Record<SatelliteIconName, ReactNode> = {
    book: (
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17Z" />
    ),
    music: (
      <path d="M9 18V5l11-2v13M9 13l11-2M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm11-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    ),
    camera: (
      <path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm8 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
    ),
    spark: (
      <path d="M12 2v6M12 16v6M2 12h6M16 12h6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M19.1 4.9l-4.2 4.2M9.1 14.9l-4.2 4.2" />
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="#e8dcc0"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {icons[name] ?? icons.spark}
    </svg>
  );
}

export function SatelliteCards({
  isActive,
  items = DEFAULT_SATELLITES,
}: {
  isActive: boolean;
  items?: SatelliteCardItem[];
}) {
  return (
    <>
      {items.map((card, i) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.3, rotate: 0 }}
          animate={
            isActive
              ? {
                  opacity: 1,
                  x: card.offsetX,
                  y: card.offsetY,
                  scale: 1,
                  rotate: card.rotate,
                }
              : { opacity: 0, x: 0, y: 0, scale: 0.3, rotate: 0 }
          }
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 18,
            mass: 0.9,
            delay: isActive ? i * 0.05 : 0,
          }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            marginTop: -40,
            marginLeft: -36,
            width: 72,
            zIndex: 5,
            pointerEvents: "none",
            visibility: isActive ? "visible" : "hidden",
          }}
        >
          <div
            style={{
              background: card.color,
              border: "1px solid rgba(201,166,90,0.45)",
              borderRadius: 6,
              padding: 10,
              boxShadow: "0 12px 28px rgba(0,0,0,0.55)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <SatelliteIcon name={card.icon} />
            <span
              style={{
                fontSize: 8,
                letterSpacing: "0.02em",
                color: "#e8dcc0",
                textAlign: "center",
                lineHeight: 1.3,
              }}
            >
              {card.label}
            </span>
          </div>
        </motion.div>
      ))}
    </>
  );
}
