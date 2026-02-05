"use client";

import { motion } from "framer-motion";

/** Deri / sert kapak dokusu — SVG fractal noise */
const LEATHER_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

interface Notebook3DShellProps {
  children: React.ReactNode;
  /** Sayfa çevrilirken gölge modülasyonu */
  flipInProgress?: boolean;
}

/**
 * Fiziksel defter anatomisi (3D):
 * - Sol: Kapak (deri/sert dokusu) + cilt (gerçekçi gölge, hafif kavis)
 * - Sağ: Sayfa alanı; altında çok katmanlı box-shadow ile kağıt yığını
 */
export function Notebook3DShell({ children, flipInProgress = false }: Notebook3DShellProps) {
  return (
    <motion.div
      className="relative flex justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative flex min-h-[520px] items-stretch overflow-visible rounded-2xl">
        {/* Sol kapak — deri / sert kapak dokusu */}
        <div
          className="relative w-14 shrink-0 rounded-l-2xl sm:w-16"
          style={{
            background: `
              linear-gradient(165deg, #3d362f 0%, #302b26 22%, #26221e 48%, #2c2723 72%, #363029 100%),
              ${LEATHER_TEXTURE}
            `,
            backgroundBlendMode: "normal, overlay",
            backgroundSize: "100% 100%, 120px 120px",
            boxShadow: `
              inset 2px 0 4px rgba(0,0,0,0.25),
              inset -1px 0 0 rgba(255,255,255,0.04),
              2px 0 8px rgba(0,0,0,0.15)
            `,
          }}
          aria-hidden
        >
          {/* Kapak kenar kalınlığı (3D) */}
          <div
            className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
            style={{
              background: "linear-gradient(90deg, rgba(20,18,15,0.9) 0%, transparent 100%)",
              boxShadow: "inset 1px 0 2px rgba(0,0,0,0.3)",
            }}
          />
        </div>

        {/* Cilt — orta kısım: gerçekçi gölge + hafif kavis */}
        <div
          className="relative w-5 shrink-0 sm:w-6"
          style={{
            background: `
              linear-gradient(90deg,
                rgba(0,0,0,0.6) 0%,
                rgba(0,0,0,0.35) 20%,
                rgba(0,0,0,0.15) 50%,
                rgba(0,0,0,0.35) 80%,
                rgba(0,0,0,0.6) 100%
              )
            `,
            boxShadow: `
              inset 3px 0 6px rgba(0,0,0,0.4),
              inset -3px 0 6px rgba(0,0,0,0.25),
              inset 0 0 20px rgba(0,0,0,0.2)
            `,
          }}
          aria-hidden
        >
          {/* Kavis hissi — dikey hafif gradient */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%)",
            }}
          />
          {/* Dikiş delikleri */}
          <div
            className="absolute inset-0 w-px left-1/2 -translate-x-px opacity-40"
            style={{
              background: "repeating-linear-gradient(180deg, transparent 0, transparent 10px, rgba(0,0,0,0.6) 10px, rgba(0,0,0,0.6) 12px)",
            }}
          />
        </div>

        {/* Sayfa alanı — kağıt yığını gölgesi + flipbook */}
        <div className="relative flex-1 overflow-hidden rounded-r-xl">
          {/* Kağıt yığını — sayfaların altında, her katman 1px kaydırılmış gölge */}
          <div
            className="pointer-events-none absolute inset-0 rounded-r-xl"
            style={{
              boxShadow: [
                "1px 0 0 rgba(0,0,0,0.04)",
                "2px 0 0 rgba(0,0,0,0.04)",
                "3px 0 0 rgba(0,0,0,0.05)",
                "4px 0 0 rgba(0,0,0,0.05)",
                "5px 0 0 rgba(0,0,0,0.05)",
                "6px 0 0 rgba(0,0,0,0.04)",
                "7px 0 0 rgba(0,0,0,0.04)",
                "8px 0 0 rgba(0,0,0,0.03)",
                "9px 0 0 rgba(0,0,0,0.03)",
                "10px 0 0 rgba(0,0,0,0.02)",
                "12px 2px 8px rgba(0,0,0,0.12)",
                "16px 4px 16px rgba(0,0,0,0.08)",
              ].join(", "),
              opacity: flipInProgress ? 0.85 : 1,
            }}
            aria-hidden
          />
          <div
            className="relative h-full w-full rounded-r-xl"
            style={{
              boxShadow: `
                1px 0 0 rgba(0,0,0,0.06),
                2px 0 0 rgba(0,0,0,0.05),
                3px 0 0 rgba(0,0,0,0.04),
                4px 2px 6px rgba(0,0,0,0.08),
                8px 4px 20px rgba(0,0,0,0.12)
              `,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
