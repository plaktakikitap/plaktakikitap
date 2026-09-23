"use client";

import { useEffect } from "react";

/** İzin ister + her dakika hatırlatıcıları kontrol eder. */
export function IcerikPushSetup() {
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const tick = async () => {
      if (Notification.permission !== "granted") return;
      try {
        const res = await fetch("/api/admin/icerik/hatirlaticilar-kontrol");
        if (!res.ok) return;
        const data = (await res.json()) as {
          hatirlaticilar?: {
            icerik_baslik: string;
            hesap_ad: string;
          }[];
        };
        for (const h of data.hatirlaticilar ?? []) {
          new Notification("İçerik Hatırlatıcısı", {
            body: `${h.icerik_baslik} — ${h.hesap_ad}`,
            icon: "/favicon.ico",
          });
        }
      } catch {
        /* ignore */
      }
    };

    void tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return null;
}
