"use client";

import { motion } from "framer-motion";

/** Kapak için fallback: deri hissi veren gradient + SVG noise (leather.jpg yoksa) */
const LEATHER_FALLBACK = `
  linear-gradient(165deg, #3d362f 0%, #302b26 22%, #26221e 48%, #2c2723 72%, #363029 100%),
  url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")
`;

/** Kağıt dokusu fallback: düşük kontrast noktacık (paper.jpg yoksa) */
const PAPER_NOISE_CSS = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

interface BulletJournalBookProps {
  children: React.ReactNode;
  /** Sayfa çevrilirken gölge/opacity modülasyonu */
  flipInProgress?: boolean;
}

/**
 * Defter anatomisi (book shell):
 * A) Sol kapak — deri/sert (leather.jpg veya gradient), kenar emboss
 * C) Kağıt dokusu — paper.jpg veya CSS noise, sarımsı ton
 * D) Cilt/kat izi — orta ince crease (linear-gradient + blur), spiral yok
 * E) Defter gölgesi — masada oturan çoklu gölge
 * (Beyaz kağıt yığını / sayfa kalınlığı gölgesi kaldırıldı.)
 */
export function BulletJournalBook({ children, flipInProgress = false }: BulletJournalBookProps) {
  return (
    <motion.div
      className="relative flex justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* E) Defter gölgesi: masada oturan gerçekçi çoklu gölge */}
      <div
        className="relative flex min-h-[520px] items-stretch overflow-visible rounded-2xl"
        style={{
          boxShadow: [
            "0 2px 4px rgba(0,0,0,0.06)",
            "0 6px 12px rgba(0,0,0,0.08)",
            "0 12px 24px rgba(0,0,0,0.06)",
            "0 24px 48px rgba(0,0,0,0.05)",
            "0 32px 64px rgba(0,0,0,0.04)",
          ].join(", "),
        }}
      >
        {/* A) Kapak — sol, deri/sert; texture leather.jpg veya placeholder gradient+noise */}
        <div
          className="relative w-14 shrink-0 rounded-l-2xl sm:w-16"
          style={{
            backgroundImage: `url("/textures/leather.jpg"), ${LEATHER_FALLBACK}`,
            backgroundSize: "cover, 100% 100%, 120px 120px",
            backgroundPosition: "center, 0 0, 0 0",
            backgroundRepeat: "no-repeat, no-repeat, repeat",
            backgroundBlendMode: "normal, normal, overlay",
            boxShadow: [
              "inset 2px 0 6px rgba(0,0,0,0.3)",
              "inset -2px 0 2px rgba(255,255,255,0.03)",
              "inset 0 2px 4px rgba(0,0,0,0.15)",
              "inset 0 -2px 4px rgba(0,0,0,0.1)",
              "2px 0 10px rgba(0,0,0,0.12)",
            ].join(", "),
          }}
          aria-hidden
        >
          {/* Kapak kenar kalınlığı (emboss) */}
          <div
            className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
            style={{
              background: "linear-gradient(90deg, rgba(15,12,10,0.95) 0%, transparent 100%)",
              boxShadow: "inset 1px 0 2px rgba(0,0,0,0.4), inset -1px 0 0 rgba(255,255,255,0.02)",
            }}
          />
        </div>

        {/* D) Cilt / kat izi — orta, düz cilt (spiral/tel yok); hafif crease */}
        <div
          className="relative w-5 shrink-0 sm:w-6"
          style={{
            background: `
              linear-gradient(90deg,
                rgba(0,0,0,0.55) 0%,
                rgba(0,0,0,0.2) 35%,
                rgba(0,0,0,0.08) 50%,
                rgba(0,0,0,0.2) 65%,
                rgba(0,0,0,0.55) 100%
              )
            `,
            boxShadow: [
              "inset 4px 0 8px rgba(0,0,0,0.35)",
              "inset -4px 0 8px rgba(0,0,0,0.2)",
              "inset 0 0 24px rgba(0,0,0,0.15)",
            ].join(", "),
          }}
          aria-hidden
        >
          {/* Orta katlama: çok hafif crease (gradient + blur hissi) */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.15) 48%, rgba(0,0,0,0.15) 52%, transparent 100%)",
              filter: "blur(0.5px)",
            }}
          />
        </div>

        {/* Sayfa alanı — kağıt dokusu; iki sayfa bitişik, sadece orta crease */}
        <div className="relative flex-1 overflow-hidden rounded-r-xl">
          {/* Kağıt dokusu: paper.jpg veya CSS noise + sarımsı ton */}
          <div
            className="pointer-events-none absolute inset-0 rounded-r-xl"
            style={{
              backgroundImage: `url("/textures/paper.jpg"), linear-gradient(180deg, rgba(235,220,195,0.4) 0%, transparent 20%, transparent 80%, rgba(220,205,175,0.3) 100%), linear-gradient(90deg, transparent 0%, rgba(230,218,198,0.15) 50%, transparent 100%), ${PAPER_NOISE_CSS}`,
              backgroundSize: "cover, 100% 100%, 100% 100%, 80px 80px",
              backgroundBlendMode: "normal, normal, normal, overlay",
              opacity: 0.4,
            }}
            aria-hidden
          />
          {/* Flipbook: iki sayfa bitişik, arada sadece ince kat izi (crease); ayrı kart gölgesi yok */}
          <div className="relative h-full w-full overflow-hidden rounded-r-xl">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
