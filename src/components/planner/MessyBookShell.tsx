"use client";

interface MessyBookShellProps {
  children: React.ReactNode;
  /** 0=Ocak … 11=Aralık — spine kalınlığı dinamik */
  monthIndex?: number;
  /** Sayfa çevrilirken gölge modülasyonu */
  flipInProgress?: boolean;
}

/** Deri dokusu için SVG noise */
const LEATHER_NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/**
 * Fiziksel defter iskeleti — Hyper-Realistic & Messy:
 * - Altındaki sayfaların kalınlığı (sol/sağ yığın, düzensiz kesit)
 * - Kapak deri dokusu (noise + gradient)
 * - Ortadaki spine/dikiş (3D gölge, recessed)
 */
/** Spine Logic: Ocak=sol ince/sağ kalın, Aralık=sol kalın/sağ ince */
function spineLayers(monthIndex: number) {
  const left = Math.round((monthIndex / 11) * 8) + 1;   // 1..9
  const right = Math.round(((11 - monthIndex) / 11) * 8) + 1; // 1..9
  return { left: Math.max(1, Math.min(9, left)), right: Math.max(1, Math.min(9, right)) };
}

export function MessyBookShell({ children, monthIndex = 0, flipInProgress = false }: MessyBookShellProps) {
  const { left: leftLayers, right: rightLayers } = spineLayers(monthIndex);
  const step = 4;

  return (
    <div className="relative flex justify-center">
      {/* Sol sayfa yığını — Ocak'ta çok az, Aralık'a doğru kalınlaşır */}
      {Array.from({ length: leftLayers }).map((_, i) => (
        <div
          key={`left-${i}`}
          className="pointer-events-none absolute top-0 bottom-0 w-[6px] rounded-l-md"
          style={{
            left: `calc(6% - ${(leftLayers - 1 - i) * step}px)`,
            background: "linear-gradient(90deg, rgba(55,45,38,0.5) 0%, rgba(40,35,30,0.22) 60%, transparent 100%)",
            boxShadow: `inset 1px 0 2px rgba(0,0,0,0.2), ${2 + i * 0.5}px 0 ${4 + i}px rgba(0,0,0,0.06)`,
            opacity: 0.92 - i * 0.1,
          }}
          aria-hidden
        />
      ))}
      {/* Sağ sayfa yığını — Ocak'ta kalın, Aralık'ta ince */}
      {Array.from({ length: rightLayers }).map((_, i) => (
        <div
          key={`right-${i}`}
          className="pointer-events-none absolute top-0 bottom-0 w-[6px] rounded-r-md"
          style={{
            right: `calc(6% - ${(rightLayers - 1 - i) * step}px)`,
            background: "linear-gradient(270deg, rgba(55,45,38,0.5) 0%, rgba(40,35,30,0.22) 60%, transparent 100%)",
            boxShadow: `inset -1px 0 2px rgba(0,0,0,0.2), -${2 + i * 0.5}px 0 ${4 + i}px rgba(0,0,0,0.06)`,
            opacity: 0.92 - i * 0.1,
          }}
          aria-hidden
        />
      ))}
      {/* Alt sayfa yığını kalınlığı — masa üstü gölge (flip sırasında koyulaşır) */}
      <div
        className="pointer-events-none absolute -bottom-6 left-[8%] right-[8%] h-8 rounded-b-2xl transition-all duration-200 ease-out"
        style={{
          background: "linear-gradient(180deg, rgba(70,60,50,0.15) 0%, rgba(45,38,32,0.5) 50%, rgba(35,30,26,0.6) 100%)",
          boxShadow: flipInProgress ? "0 8px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)" : "0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
          filter: flipInProgress ? "blur(4px)" : "blur(3px)",
          opacity: flipInProgress ? 0.65 : 0.5,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-3 left-[10%] right-[10%] h-5 rounded-b-xl transition-all duration-200 ease-out"
        style={{
          background: "linear-gradient(180deg, rgba(90,75,65,0.3) 0%, rgba(55,48,42,0.6) 100%)",
          boxShadow: flipInProgress ? "0 4px 16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)" : "0 3px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
        aria-hidden
      />

      {/* Ana kabuk — deri dokusu (gradient + noise), 3D gölge */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          boxShadow: `
            0 0 0 1px rgba(0,0,0,0.15),
            0 2px 4px rgba(0,0,0,0.1),
            0 8px 24px rgba(0,0,0,0.2),
            0 20px 48px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(255,255,255,0.06),
            inset 0 -1px 0 rgba(0,0,0,0.1)
          `,
          background: `
            linear-gradient(165deg, #3d362f 0%, #302b26 25%, #26221e 50%, #2c2723 75%, #363029 100%),
            ${LEATHER_NOISE}
          `,
          backgroundBlendMode: "normal, overlay",
          backgroundSize: "100% 100%, 120px 120px",
        }}
      >
        {/* Spine — ortadaki dikiş/birleşme, recessed 3D hissi */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-5 -translate-x-1/2"
          style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 20%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.35) 100%)",
            boxShadow: "inset 2px 0 1px rgba(255,255,255,0.02), inset -2px 0 1px rgba(0,0,0,0.1)",
          }}
          aria-hidden
        />
        {/* Spine dikiş detayı — delikler hissi */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 opacity-20"
          style={{ background: "repeating-linear-gradient(180deg, transparent 0, transparent 8px, rgba(0,0,0,0.4) 8px, rgba(0,0,0,0.4) 10px)" }}
          aria-hidden
        />

        {/* Kapak kenar kalınlığı — sağ (6-10px hissi) */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-2 rounded-r-2xl"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(28,24,20,0.7) 100%)",
            boxShadow: "inset -1px 0 2px rgba(0,0,0,0.2)",
          }}
          aria-hidden
        />

        {/* Kapak kenar kalınlığı — sol */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-2 rounded-l-2xl"
          style={{
            background: "linear-gradient(270deg, transparent 0%, rgba(28,24,20,0.7) 100%)",
            boxShadow: "inset 1px 0 2px rgba(0,0,0,0.2)",
          }}
          aria-hidden
        />

        {/* Kapak kenar kalınlığı — alt (6-10px) */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-2.5 rounded-b-2xl"
          style={{
            background: "linear-gradient(180deg, transparent 0%, rgba(32,28,24,0.6) 100%)",
            boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.15)",
          }}
          aria-hidden
        />

        <div className="relative overflow-hidden rounded-2xl">{children}</div>
      </div>
    </div>
  );
}
