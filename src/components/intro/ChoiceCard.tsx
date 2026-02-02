"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  href: string;
  src: string;
  alt: string;
  label: string;
  glow: "red" | "blue";
};

export default function ChoiceCard({ href, src, alt, label, glow }: Props) {
  const reduce = useReducedMotion();

  const glowFilter =
    glow === "red"
      ? "drop-shadow(0 0 18px rgba(255,60,60,0.55)) drop-shadow(0 0 38px rgba(255,0,0,0.35))"
      : "drop-shadow(0 0 18px rgba(80,140,255,0.55)) drop-shadow(0 0 38px rgba(40,120,255,0.35))";

  return (
    <Link href={href} aria-label={label} className="outline-none">
      <motion.div
        whileHover={
          reduce
            ? undefined
            : {
                y: -10,
                scale: 1.03,
                transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
              }
        }
        whileFocus={
          reduce
            ? undefined
            : {
                y: -10,
                scale: 1.03,
                transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
              }
        }
        className="group relative flex flex-col items-center"
      >
        {/* The image itself gets the glow so it hugs the PNG shape */}
        <div
          className="relative h-[260px] w-[360px] sm:h-[300px] sm:w-[420px]"
          style={{
            filter: "drop-shadow(0 28px 55px rgba(0,0,0,0.55))",
          }}
        >
          <div
            className="absolute inset-0 transition duration-300 ease-out group-hover:opacity-100 opacity-0"
            style={{ filter: glowFilter }}
          />
          <Image
            src={src}
            alt={alt}
            fill
            priority
            className="object-contain select-none"
            draggable={false}
          />
        </div>

        <div className="mt-6 text-sm tracking-wide text-[#F3EBDD]/85">
          {label}
        </div>
      </motion.div>
    </Link>
  );
}
