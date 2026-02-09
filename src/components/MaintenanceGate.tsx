"use client";

import { useState, useEffect } from "react";

export function MaintenanceGate() {
  const [show, setShow] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((s) => {
        if (!s.maintenance_mode) {
          setShow(false);
          return;
        }
        const isAdmin = document.cookie.includes("pk_admin=");
        setShow(!isAdmin);
      })
      .catch(() => setShow(false));
  }, []);

  if (show !== true) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050A14] text-white">
      <div className="mx-auto max-w-md px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Yapım Aşamasında</h1>
        <p className="mt-3 text-white/70">
          Site şu an güncelleniyor. Kısa süre sonra tekrar ziyaret edebilirsiniz.
        </p>
        <a
          href="/admin/login"
          className="mt-6 inline-block rounded-xl bg-amber-500/20 px-4 py-2 text-sm text-amber-400 hover:bg-amber-500/30"
        >
          Yönetici girişi
        </a>
      </div>
    </div>
  );
}
