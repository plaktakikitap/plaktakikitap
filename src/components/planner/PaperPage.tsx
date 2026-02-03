"use client";

interface PaperPageProps {
  children: React.ReactNode;
  className?: string;
  variant?: "calendar" | "notes";
  cornerCurl?: boolean;
}

export function PaperPage({
  children,
  className = "",
  variant = "calendar",
  cornerCurl = false,
}: PaperPageProps) {
  const lineOpacity = variant === "notes" ? 0.06 : 0.035;

  return (
    <div
      className={
        "relative h-full min-h-[520px] w-full overflow-hidden rounded-[14px] border border-black/10 bg-[#F3EAD7] text-[#201A14] shadow-[0_10px_40px_rgba(0,0,0,0.35)] " +
        className
      }
      style={{
        backgroundImage: [
          `repeating-linear-gradient(transparent, transparent 30px, rgba(0,0,0,${lineOpacity}) 30px, rgba(0,0,0,${lineOpacity}) 31px)`,
          "linear-gradient(rgba(0,0,0,0.03), transparent)",
        ].join(", "),
        backgroundSize: "auto, auto",
      }}
    >
      {/* Noise/grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[14px] opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Vignette — kenarlarda hafif karartma */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[14px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 50%, rgba(0,0,0,0.04) 100%)",
        }}
      />

      {/* Mevcut radial gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[14px] opacity-30"
        style={{
          background:
            "radial-gradient(600px 240px at 50% 20%, rgba(0,0,0,0.06), transparent 55%), radial-gradient(600px 240px at 50% 90%, rgba(0,0,0,0.05), transparent 60%)",
        }}
      />

      {/* Köşe kıvrımı — sağ sayfa sağ üst */}
      {cornerCurl && (
        <div
          className="pointer-events-none absolute right-0 top-0 h-14 w-14 rounded-bl-xl"
          style={{
            background: `linear-gradient(135deg, transparent 45%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.09) 58%, transparent 65%)`,
          }}
        />
      )}

      <div className="relative h-full w-full p-6">{children}</div>
    </div>
  );
}
