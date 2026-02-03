"use client";

import { useCallback, useEffect, useState } from "react";
import { playSound, areSoundsEnabled, setSoundsEnabled } from "@/lib/audio";

export function useSoundsEnabled() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(areSoundsEnabled());
    const handler = () => setEnabled(areSoundsEnabled());
    window.addEventListener("sounds-enabled-changed", handler);
    return () => window.removeEventListener("sounds-enabled-changed", handler);
  }, []);

  const toggle = useCallback(() => {
    const next = !areSoundsEnabled();
    setSoundsEnabled(next);
    setEnabled(next);
  }, []);

  return [enabled, toggle] as const;
}

export function usePlaySound() {
  const play = useCallback(
    (
      src: string,
      options?: { volume?: number; playbackRate?: number; onEnded?: () => void }
    ) => playSound(src, options),
    []
  );
  return play;
}
