"use client";

import { usePathname } from "next/navigation";

/** Tüm sitede krem zemin + hafif doku / parıltı (intro gate hariç — orada siyah) */
export default function SiteBackground() {
  const pathname = usePathname();

  // Make Your Choice — özel: siyah zemin
  if (pathname === "/") {
    return <div aria-hidden className="fixed inset-0 -z-10 bg-black" />;
  }

  const sparkles = [
    { left: "14%", top: "18%", size: 5, delay: "0s", dur: "3.6s" },
    { left: "28%", top: "42%", size: 3, delay: "0.7s", dur: "4.2s" },
    { left: "48%", top: "12%", size: 4, delay: "1.4s", dur: "3.8s" },
    { left: "62%", top: "36%", size: 3, delay: "0.3s", dur: "4.6s" },
    { left: "78%", top: "22%", size: 5, delay: "1.1s", dur: "3.4s" },
    { left: "86%", top: "58%", size: 3, delay: "2s", dur: "4.1s" },
    { left: "18%", top: "68%", size: 4, delay: "1.6s", dur: "3.9s" },
    { left: "38%", top: "78%", size: 3, delay: "0.5s", dur: "4.4s" },
    { left: "55%", top: "62%", size: 5, delay: "2.3s", dur: "3.7s" },
    { left: "72%", top: "82%", size: 3, delay: "1.8s", dur: "4.8s" },
    { left: "8%", top: "48%", size: 3, delay: "2.6s", dur: "3.5s" },
    { left: "92%", top: "40%", size: 4, delay: "0.9s", dur: "4s" },
  ];

  return (
    <div aria-hidden className="fixed inset-0 -z-10 bg-cream">
      <div
        className="absolute inset-0 opacity-[0.35] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(rgba(26,22,18,0.06) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, transparent 50%, rgba(26,22,18,0.05) 100%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0">
        {sparkles.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-sparkle-brown"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              background:
                "radial-gradient(circle at center, color-mix(in srgb, var(--gold) 70%, transparent) 0%, color-mix(in srgb, var(--gold) 25%, transparent) 45%, transparent 72%)",
              boxShadow: "0 0 6px color-mix(in srgb, var(--gold) 30%, transparent)",
              animationDelay: s.delay,
              animationDuration: s.dur,
            }}
          />
        ))}
      </div>
    </div>
  );
}
