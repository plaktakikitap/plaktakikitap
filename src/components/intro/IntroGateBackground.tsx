"use client";

/**
 * Midnight navy background for Intro Gate: spotlight + vignette.
 */
export function IntroGateBackground() {
  return (
    <>
      <div
        className="fixed inset-0 -z-10"
        style={{ backgroundColor: "#050A14" }}
        aria-hidden
      />
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `radial-gradient(900px 600px at 50% 25%, rgba(255,255,255,0.08), transparent 60%)`,
        }}
        aria-hidden
      />
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 35%, transparent 60%, rgba(0,0,0,0.75) 100%)`,
        }}
        aria-hidden
      />
      <div
        className="fixed inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          mixBlendMode: "soft-light",
        }}
        aria-hidden
      />
    </>
  );
}
