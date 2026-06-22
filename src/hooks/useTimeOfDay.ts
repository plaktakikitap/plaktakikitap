"use client";

import { useEffect, useState } from "react";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export const TIME_PALETTES = {
  morning: { bg: "#0d0a08", glow: "rgba(180, 120, 70, 0.25)" },
  afternoon: { bg: "#0a0908", glow: "rgba(180, 50, 40, 0.30)" },
  evening: { bg: "#0a0809", glow: "rgba(160, 70, 90, 0.28)" },
  night: { bg: "#08080d", glow: "rgba(70, 60, 130, 0.22)" },
} as const;

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

/** Yerel saate göre gün dilimi — mount'ta bir kez hesaplanır (SSR: afternoon). */
export function useTimeOfDay(): TimeOfDay {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("afternoon");

  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
  }, []);

  return timeOfDay;
}
