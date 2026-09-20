"use client";

import { AnimatePresence, motion } from "framer-motion";

export type SatelliteItem = {
  id: string;
  label: string;
  /** Görsel yolu — dosya yoksa `color` placeholder kullanılır */
  image?: string;
  color: string;
  style: React.CSSProperties;
  scatter: { x: number; y: number };
};

export const DEFAULT_SATELLITES: SatelliteItem[] = [
  {
    id: "reading",
    label: "Okuduğum",
    image: "/images/satellites/reading.jpg",
    color: "#3d2b1f",
    style: { top: "4%", left: "-16%" },
    scatter: { x: -32, y: -8 },
  },
  {
    id: "music",
    label: "Dinlediğim",
    image: "/images/satellites/music.jpg",
    color: "#2a2438",
    style: { top: "72%", left: "108%" },
    scatter: { x: 34, y: 12 },
  },
  {
    id: "photo",
    label: "Fotoğraf",
    image: "/images/satellites/photo.jpg",
    color: "#1f2a24",
    style: { top: "-12%", left: "72%" },
    scatter: { x: 18, y: -28 },
  },
  {
    id: "project",
    label: "Proje",
    image: "/images/satellites/project.jpg",
    color: "#2c2418",
    style: { top: "88%", left: "8%" },
    scatter: { x: -20, y: 28 },
  },
  {
    id: "cartoon",
    label: "Karikatür",
    image: "/images/satellites/cartoon.jpg",
    color: "#352218",
    style: { top: "18%", left: "110%" },
    scatter: { x: 38, y: -6 },
  },
];

const SPRING = { type: "spring" as const, stiffness: 280, damping: 24 };

interface SatelliteCardsProps {
  active: boolean;
  items?: SatelliteItem[];
}

function SatelliteCard({
  item,
  index,
}: {
  item: SatelliteItem;
  index: number;
}) {
  return (
    <motion.div
      key={item.id}
      className="pointer-events-none absolute z-[25] h-11 w-11 overflow-hidden rounded-md border border-[#c9a65a]/30 shadow-[0_6px_20px_rgba(0,0,0,0.45)]"
      style={{
        ...item.style,
        backgroundColor: item.color,
      }}
      initial={{ opacity: 0, scale: 0.55, x: 0, y: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: item.scatter.x,
        y: item.scatter.y,
      }}
      exit={{ opacity: 0, scale: 0.55, x: 0, y: 0 }}
      transition={{
        ...SPRING,
        delay: index * 0.04,
      }}
      aria-hidden
    >
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
    </motion.div>
  );
}

export function SatelliteCards({
  active,
  items = DEFAULT_SATELLITES,
}: SatelliteCardsProps) {
  return (
    <AnimatePresence>
      {active
        ? items.map((item, index) => (
            <SatelliteCard key={item.id} item={item} index={index} />
          ))
        : null}
    </AnimatePresence>
  );
}
