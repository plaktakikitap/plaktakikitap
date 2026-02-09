"use client";

import { motion } from "framer-motion";

const OVERHANG = 15;

interface HardcoverBookShellProps {
  children: React.ReactNode;
  spreadWidth: number;
  spreadHeight: number;
}

/**
 * Outer shell: bigger than pages by OVERHANG px on ALL sides (true overhang).
 * Leather texture overlay, rounded corners, desk shadow, spine crease, page stack effect.
 */
export function HardcoverBookShell({
  children,
  spreadWidth,
  spreadHeight,
}: HardcoverBookShellProps) {
  return (
    <motion.div
      className="relative mx-auto my-10 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="relative overflow-visible"
        style={{
          padding: OVERHANG,
          background: "#3d2b1f",
          backgroundImage: "url('/textures/leather.jpg')",
          backgroundSize: "cover",
          backgroundBlendMode: "overlay",
          borderRadius: "10px 18px 18px 10px",
          boxShadow: `
            20px 20px 50px rgba(0,0,0,0.6),
            inset 0 0 15px rgba(0,0,0,0.5)
          `,
          display: "inline-block",
        }}
      >
        <div
          className="relative overflow-hidden rounded-md bg-[#fdfaf3]"
          style={{
            width: spreadWidth,
            height: spreadHeight,
          }}
        >
          {children}

          {/* Spine — center gradient so pages feel bound to spine */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-10 -translate-x-1/2 pointer-events-none z-20"
            style={{
              background: `linear-gradient(to right,
                rgba(0,0,0,0.3) 0%,
                rgba(0,0,0,0) 20%,
                rgba(0,0,0,0.1) 50%,
                rgba(0,0,0,0) 80%,
                rgba(0,0,0,0.3) 100%)`,
            }}
            aria-hidden
          />

          {/* Page stack effect — right edge */}
          <div
            className="absolute right-2 top-[15px] bottom-[15px] w-1 rounded-sm pointer-events-none"
            style={{
              background: "repeating-linear-gradient(to bottom, #ddd 0px, #ddd 1px, #fff 2px)",
              boxShadow: "2px 0 5px rgba(0,0,0,0.2)",
            }}
            aria-hidden
          />
        </div>
      </div>
    </motion.div>
  );
}
