export default function SiteBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10">
      {/* Koyu lacivert + hafif vignette + grain */}
      <div className="absolute inset-0 bg-[#050A12]" />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% 15%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(900px 500px at 20% 80%, rgba(255,255,255,0.04), transparent 65%), radial-gradient(900px 500px at 80% 80%, rgba(255,255,255,0.04), transparent 65%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          filter: "blur(0.3px)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 90%)",
        }}
      />

      {/* Nadir ışıltı / parıltı noktaları */}
      <div className="absolute inset-0 pointer-events-none">
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
    </div>
  );
}
