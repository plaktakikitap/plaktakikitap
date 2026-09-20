"use client";

type LanguagePillProps = {
  source: string;
  target: string;
  /** on-dark: detay penceresi gibi koyu zemin */
  variant?: "default" | "on-dark";
};

export function LanguagePill({ source, target, variant = "default" }: LanguagePillProps) {
  const onDark = variant === "on-dark";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-light tracking-widest text-xs ${
        onDark ? "" : "bg-gold-soft text-ink"
      }`}
      style={
        onDark
          ? {
              color: "#f5f0e8",
              backgroundColor: "rgba(245, 240, 232, 0.22)",
              border: "1px solid rgba(245, 240, 232, 0.55)",
            }
          : undefined
      }
    >
      {source.toUpperCase()} → {target.toUpperCase()}
    </span>
  );
}
