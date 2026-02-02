"use client";

type EntrySeed = "plak" | "kitap" | null;

/**
 * Midnight "museum wall" background: deep navy, spotlight, vignette.
 * Optional entry seed: plak = warm gold tint, kitap = paper/ivory tint.
 */
export function HomeHeroBackground({ entrySeed = null }: { entrySeed?: EntrySeed }) {
  // Subtle accent based on intro choice
  const accentGradient =
    entrySeed === "plak"
      ? "radial-gradient(700px 500px at 55% 30%, rgba(216,176,84,0.12), transparent 65%)"
      : entrySeed === "kitap"
        ? "radial-gradient(700px 500px at 55% 30%, rgba(250,245,235,0.06), transparent 65%)"
        : "radial-gradient(700px 500px at 55% 30%, rgba(216,176,84,0.08), transparent 65%)";

  return (
    <>
      {/* Base navy */}
      <div
        className="fixed inset-0 -z-10"
        style={{ backgroundColor: "#050A14" }}
        aria-hidden
      />

      {/* Spotlight - soft center glow */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `radial-gradient(900px 600px at 50% 18%, rgba(255,255,255,0.08), transparent 60%)`,
        }}
        aria-hidden
      />

      {/* Warm subtle accent (or paper tint for kitap) */}
      <div
        className="fixed inset-0 -z-10"
        style={{ background: accentGradient }}
        aria-hidden
      />

      {/* Vignette */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.75) 100%)`,
        }}
        aria-hidden
      />

      {/* Extremely subtle texture - not readable as tiles */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          mixBlendMode: "soft-light",
        }}
        aria-hidden
      />

      {/* Nadir ışıltı / parıltı noktaları */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        aria-hidden
      >
        <div
          className="absolute w-3 h-3 rounded-full animate-sparkle"
          style={{
            left: "18%",
            top: "22%",
            background: "radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 40%, transparent 65%)",
            boxShadow: "0 0 8px rgba(255,255,255,0.3)",
            animationDelay: "0s",
          }}
        />
        <div
          className="absolute w-3 h-3 rounded-full animate-sparkle"
          style={{
            left: "82%",
            top: "28%",
            background: "radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 40%, transparent 65%)",
            boxShadow: "0 0 8px rgba(255,255,255,0.3)",
            animationDelay: "1.2s",
          }}
        />
        <div
          className="absolute w-4 h-4 rounded-full animate-sparkle"
          style={{
            left: "12%",
            top: "65%",
            background: "radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 40%, transparent 65%)",
            boxShadow: "0 0 10px rgba(255,255,255,0.35)",
            animationDelay: "2.4s",
          }}
        />
        <div
          className="absolute w-3 h-3 rounded-full animate-sparkle"
          style={{
            left: "88%",
            top: "72%",
            background: "radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 40%, transparent 65%)",
            boxShadow: "0 0 8px rgba(255,255,255,0.3)",
            animationDelay: "0.8s",
          }}
        />
        <div
          className="absolute w-3 h-3 rounded-full animate-sparkle"
          style={{
            left: "45%",
            top: "12%",
            background: "radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 40%, transparent 65%)",
            boxShadow: "0 0 8px rgba(255,255,255,0.3)",
            animationDelay: "1.8s",
          }}
        />
      </div>
    </>
  );
}
