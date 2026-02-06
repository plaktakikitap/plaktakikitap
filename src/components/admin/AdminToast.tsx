"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const MESSAGE = "Başarıyla kaydedildi! ✨";

export function AdminToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const toast = searchParams.get("toast");
    const err = searchParams.get("err");
    const msg = searchParams.get("msg");

    if (toast === "saved") {
      setErrorMsg(null);
      setVisible(true);
      setAnimating(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("toast");
      router.replace(url.pathname + (url.search || ""), { scroll: false });
      const t = setTimeout(() => setAnimating(false), 300);
      const hide = setTimeout(() => setVisible(false), 3500);
      return () => { clearTimeout(t); clearTimeout(hide); };
    }

    if (err) {
      setErrorMsg(msg ? decodeURIComponent(msg) : "Kayıt sırasında bir hata oluştu.");
      setVisible(true);
      setAnimating(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("err");
      url.searchParams.delete("msg");
      router.replace(url.pathname + (url.search || ""), { scroll: false });
      const hide = setTimeout(() => { setVisible(false); setErrorMsg(null); }, 5000);
      return () => clearTimeout(hide);
    }
  }, [searchParams, router]);

  if (!visible) return null;

  return (
    <div
      className="fixed right-4 top-20 z-[100] transition-all duration-300 ease-out lg:top-4"
      style={{
        opacity: animating ? 1 : 0,
        transform: animating ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.96)",
      }}
      role="alert"
    >
      <div
        className={`flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-lg backdrop-blur-xl ${
          errorMsg
            ? "border-red-400/30 bg-red-500/10 dark:bg-red-950/50"
            : "border-amber-400/20 bg-white/90 dark:bg-black/80 dark:border-amber-400/30 shadow-amber-500/10"
        }`}
        style={{
          boxShadow: errorMsg ? "0 8px 32px -4px rgba(239,68,68,0.15)" : "0 8px 32px -4px rgba(212, 175, 55, 0.15)",
        }}
      >
        <span className="text-lg" aria-hidden>
          {errorMsg ? "⚠️" : "✨"}
        </span>
        <p className="font-display text-sm font-medium text-[var(--foreground)]">
          {errorMsg ?? MESSAGE}
        </p>
      </div>
    </div>
  );
}
