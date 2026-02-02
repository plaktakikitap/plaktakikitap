"use client";

import { motion, useReducedMotion } from "framer-motion";

function ScrollIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

export function ScrollIndicator() {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className="flex shrink-0 text-[#F3EBDD]/55"
      animate={
        reduce
          ? false
          : {
              y: [0, 10, 0],
              opacity: [1, 0.6, 1],
            }
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <ScrollIcon />
    </motion.span>
  );
}

export function ScrollHint() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="mt-20 flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : 1.2, duration: 0.6 }}
    >
      <span className="font-sans text-sm font-normal tracking-[0.12em] text-[#F3EBDD]/65 uppercase">
        Aşağı kaydır
      </span>
      <motion.span
        className="block text-[#F3EBDD]/55"
        animate={reduce ? false : { y: [0, 6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ScrollIcon />
      </motion.span>
    </motion.div>
  );
}
