"use client";

import { useEffect } from "react";

export function SiteSoundVolumeHydrate() {
  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((s) => {
        const v = s.sound_volume;
        if (typeof v === "number") {
          window.__SITE_SOUND_VOLUME__ = Math.min(100, Math.max(0, v)) / 100;
        }
      })
      .catch(() => {});
  }, []);
  return null;
}
