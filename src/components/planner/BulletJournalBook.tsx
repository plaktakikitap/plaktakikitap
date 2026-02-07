"use client";

import { motion } from "framer-motion";

/** Kağıt dokusu fallback: hafif grain (paper.jpg yoksa) */
const PAPER_NOISE_CSS = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

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
      {/* Defter gölgesi: masada oturan gerçek defter hissi */}
      <div
        className="relative flex min-h-[620px] items-stretch overflow-visible rounded-xl"
        style={{
          boxShadow: [
            "6px 6px 20px rgba(0,0,0,0.4)",
            "12px 12px 40px rgba(0,0,0,0.3)",
            "0 32px 80px -16px rgba(0,0,0,0.35)",
          ].join(", "),
        }}
      >
        {/* Sayfa alanı — sadece flipbook, kutucuk/spine yok */}
        <div className="relative flex-1 overflow-hidden rounded-xl">
          {/* Kağıt dokusu: paper.jpg veya CSS noise + sarımsı ton */}
          <div
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{
              backgroundImage: `url("/textures/paper.jpg"), linear-gradient(180deg, rgba(240,230,210,0.3) 0%, transparent 25%, transparent 75%, rgba(225,210,185,0.25) 100%), linear-gradient(90deg, transparent 0%, rgba(230,218,198,0.1) 50%, transparent 100%), ${PAPER_NOISE_CSS}`,
              backgroundSize: "cover, 100% 100%, 100% 100%, 100px 100px",
              backgroundBlendMode: "normal, normal, normal, soft-light",
              opacity: 0.35,
              zIndex: 0,
            }}
            aria-hidden
          />
          {/* Flipbook: iki sayfa bitişik — kağıt overlay'ın üstünde */}
          <div className="relative z-10 h-full w-full overflow-hidden rounded-xl">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
