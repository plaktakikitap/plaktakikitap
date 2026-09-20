"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useReducedMotion,
} from "framer-motion";

// BURAYI GERÇEK YAYIN TARİHİYLE DEĞİŞTİR
const SITE_LAUNCH_DATE = new Date("2026-01-15");

function getDaysSinceLaunch() {
  const now = new Date();
  const diffMs = now.getTime() - SITE_LAUNCH_DATE.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export default function SiteAgeCounter() {
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);
  const startedRef = useRef(false);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);
  const targetDays = getDaysSinceLaunch();

  const launchLabel = SITE_LAUNCH_DATE.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));
    return () => unsubscribe();
  }, [rounded]);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  const startCountAnimation = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (reduceMotion) {
      count.set(targetDays);
      setDisplayValue(targetDays);
      return;
    }

    controlsRef.current = animate(count, targetDays, {
      duration: 1.4,
      ease: "easeOut",
    });
  }, [count, reduceMotion, targetDays]);

  return (
    <motion.div
      className="mx-auto max-w-6xl px-4 pt-6 text-center text-[0.8rem] tracking-[0.02em] text-[#9a9488] sm:px-6 sm:pb-1"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onViewportEnter={startCountAnimation}
    >
      Bu site {launchLabel}&apos;dan beri yaşıyor
      {" — "}
      <span className="text-[#c9a65a] [font-variant-numeric:tabular-nums]">
        {displayValue.toLocaleString("tr-TR")}
      </span>
      {" gündür burada"}
    </motion.div>
  );
}
