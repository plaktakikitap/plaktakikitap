"use client";

type EntrySeed = "plak" | "kitap" | null;

/**
 * Krem zemin — ana sayfa hero (SiteBackground ile uyumlu).
 */
export function HomeHeroBackground({ entrySeed = null }: { entrySeed?: EntrySeed }) {
  const accentGradient =
    entrySeed === "plak"
      ? "radial-gradient(700px 500px at 55% 30%, rgba(184,147,74,0.12), transparent 65%)"
      : entrySeed === "kitap"
        ? "radial-gradient(700px 500px at 55% 30%, rgba(26,22,18,0.04), transparent 65%)"
        : "radial-gradient(700px 500px at 55% 30%, rgba(184,147,74,0.08), transparent 65%)";

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-cream" aria-hidden />
      <div
        className="fixed inset-0 -z-10"
        style={{ background: accentGradient }}
        aria-hidden
      />
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, transparent 50%, rgba(26,22,18,0.05) 100%)",
        }}
        aria-hidden
      />
    </>
  );
}
