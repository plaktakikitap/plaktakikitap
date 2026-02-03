"use client";

import type { PlannerDecor } from "@/lib/planner";

/** Demo fallback decors when DB empty */
const DEMO_DECORS: Omit<PlannerDecor, "id" | "year" | "month">[] = [
  { page: "left", type: "sticker", assetUrl: null, x: 0.12, y: 0.88, rotation: -6, scale: 1, z: 10 },
  { page: "left", type: "sticker", assetUrl: null, x: 0.9, y: 0.15, rotation: 8, scale: 0.9, z: 10 },
  { page: "right", type: "tape", assetUrl: null, x: 0.85, y: 0.08, rotation: 12, scale: 1, z: 10 },
  { page: "right", type: "paperclip", assetUrl: null, x: 0.08, y: 0.06, rotation: -15, scale: 1, z: 11 },
];

interface DecorLayerProps {
  page: "left" | "right";
  decors: PlannerDecor[];
  useDemoFallback?: boolean;
}

export function DecorLayer({
  page,
  decors,
  useDemoFallback = true,
}: DecorLayerProps) {
  const items = decors.filter((d) => d.page === page);
  const display = items.length > 0 ? items : (useDemoFallback ? DEMO_DECORS.filter((d) => d.page === page) : []);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {display.map((d, i) => {
        const key = "id" in d ? String((d as PlannerDecor).id) : `demo-${page}-${i}`;
        const decor: PlannerDecor =
          "id" in d && "year" in d
            ? (d as PlannerDecor)
            : ({ ...d, id: key, year: 0, month: 0 } as PlannerDecor);
        return <DecorItem key={key} decor={decor} />;
      })}
    </div>
  );
}

function DecorItem({ decor }: { decor: PlannerDecor }) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: `${decor.x * 100}%`,
    top: `${decor.y * 100}%`,
    transform: `translate(-50%, -50%) rotate(${decor.rotation}deg) scale(${decor.scale})`,
    zIndex: decor.z,
  };

  if (decor.assetUrl) {
    return (
      <img
        src={decor.assetUrl}
        alt=""
        className="h-auto max-h-16 w-auto max-w-16 object-contain"
        style={style}
        draggable={false}
      />
    );
  }

  switch (decor.type) {
    case "sticker":
      return (
        <div
          style={style}
          className="h-12 w-12 rounded-lg shadow-md"
          title="Sticker"
        >
          <div
            className="h-full w-full rounded-lg"
            style={{
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)",
              border: "1px solid rgba(251,191,36,0.4)",
            }}
          >
            <span className="flex h-full items-center justify-center text-xs">📌</span>
          </div>
        </div>
      );

    case "tape":
      return (
        <div
          style={{
            ...style,
            opacity: 0.92,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
          }}
          className="h-5 w-16"
          title="Tape"
        >
          <div
            className="h-full w-full"
            style={{
              background: "linear-gradient(180deg, rgba(254,202,202,0.85) 0%, rgba(252,165,165,0.9) 100%)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              borderTop: "1px solid rgba(255,255,255,0.5)",
              borderBottom: "1px solid rgba(0,0,0,0.1)",
            }}
          />
        </div>
      );

    case "paperclip":
      return (
        <div
          style={{
            ...style,
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
          }}
          className="h-5 w-3"
          title="Paperclip"
        >
          <div
            className="h-full w-full rounded-sm"
            style={{
              background: "linear-gradient(180deg, #9ca3af 0%, #6b7280 30%, #4b5563 70%, #6b7280 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.25)",
            }}
          />
        </div>
      );

    case "pin":
      return (
        <div style={style} className="h-8 w-8" title="Pin">
          <div
            className="h-full w-full rounded-full"
            style={{
              background: "linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          />
        </div>
      );

    default:
      return null;
  }
}
