"use client";

interface MessyBookShellProps {
  children: React.ReactNode;
  /** 0=Ocak … 11=Aralık — spine kalınlığı dinamik */
  monthIndex?: number;
}

/**
 * Fiziksel defter iskeleti:
 * - Dinamik sayfa yığını (Ocak: sol ince sağ kalın, Aralık: sol kalın sağ ince)
 * - Kapak deri dokusu
 * - Ortadaki spine
 */
export function MessyBookShell({ children, monthIndex = 0 }: MessyBookShellProps) {
  const leftLayers = Math.max(1, Math.round((monthIndex / 11) * 5));
  const rightLayers = Math.max(1, Math.round(((11 - monthIndex) / 11) * 5));

  return (
    <div className="relative flex justify-center">
      {/* Sol sayfa yığını — Ocak'ta az, Aralık'ta kalın */}
      {Array.from({ length: leftLayers }).map((_, i) => (
        <div
          key={`left-${i}`}
          className="pointer-events-none absolute left-[8%] top-0 bottom-0 w-2 rounded-l-lg opacity-30"
          style={{
            left: `calc(8% - ${(leftLayers - 1 - i) * 3}px)`,
            background: "linear-gradient(90deg, rgba(60,50,40,0.3) 0%, transparent 100%)",
            boxShadow: "inset 2px 0 4px rgba(0,0,0,0.1)",
          }}
          aria-hidden
        />
      ))}
      {/* Sağ sayfa yığını — Ocak'ta kalın, Aralık'ta az */}
      {Array.from({ length: rightLayers }).map((_, i) => (
        <div
          key={`right-${i}`}
          className="pointer-events-none absolute right-[8%] top-0 bottom-0 w-2 rounded-r-lg opacity-30"
          style={{
            right: `calc(8% - ${(rightLayers - 1 - i) * 3}px)`,
            background: "linear-gradient(270deg, rgba(60,50,40,0.3) 0%, transparent 100%)",
            boxShadow: "inset -2px 0 4px rgba(0,0,0,0.1)",
          }}
          aria-hidden
        />
      ))}
      {/* Alt sayfa yığını kalınlığı */}
      <div
        className="pointer-events-none absolute -bottom-4 left-[10%] right-[10%] h-6 rounded-b-2xl opacity-40"
        style={{
          background: "linear-gradient(180deg, rgba(60,50,40,0.2) 0%, rgba(40,35,30,0.4) 100%)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          filter: "blur(2px)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-2 left-[12%] right-[12%] h-4 rounded-b-xl"
        style={{
          background: "linear-gradient(180deg, rgba(80,70,60,0.25) 0%, rgba(50,45,40,0.5) 100%)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
        aria-hidden
      />

      {/* Ana kabuk - deri dokusu hissi */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          boxShadow: `
            0 0 0 1px rgba(0,0,0,0.1),
            0 4px 16px rgba(0,0,0,0.15),
            0 12px 32px rgba(0,0,0,0.2),
            0 24px 64px rgba(0,0,0,0.35),
            inset 0 1px 0 rgba(255,255,255,0.05)
          `,
          background: "linear-gradient(135deg, #3a3530 0%, #2d2824 30%, #252220 70%, #2a2522 100%)",
        }}
      >
        {/* Spine - ortadaki dikiş/birleşme */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-4 -translate-x-1/2"
          style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0.12) 70%, rgba(0,0,0,0.25) 100%)",
            boxShadow: "inset 1px 0 0 rgba(255,255,255,0.03)",
          }}
          aria-hidden
        />

        {/* Kapak kenar kalınlığı - sağ */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-1.5 rounded-r-2xl"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(30,26,22,0.6) 100%)",
          }}
          aria-hidden
        />

        {/* Kapak kenar kalınlığı - alt */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-2 rounded-b-2xl"
          style={{
            background: "linear-gradient(180deg, transparent 0%, rgba(35,30,26,0.5) 100%)",
          }}
          aria-hidden
        />

        <div className="relative overflow-hidden rounded-2xl">{children}</div>
      </div>
    </div>
  );
}
