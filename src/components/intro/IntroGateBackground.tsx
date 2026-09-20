"use client";

/**
 * Krem zemin — intro gate (SiteBackground ile aynı palet).
 */
export function IntroGateBackground() {
  return (
    <>
      <div
        className="fixed inset-0 -z-10 bg-cream"
        aria-hidden
      />
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 600px at 50% 25%, rgba(184,147,74,0.08), transparent 60%)",
        }}
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
