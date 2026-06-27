"use client";

/** Beni Tanıyın sayfa sarmalayıcısı — arka plan scroll ile değişmez. */
export function BeniTaniyinShell({ children }: { children: React.ReactNode }) {
  return <div className="relative min-h-screen">{children}</div>;
}
