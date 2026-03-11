"use client";

export function LanguagePill({ source, target }: { source: string; target: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2.5 py-0.5 font-light tracking-widest text-white text-xs">
      {source.toUpperCase()} → {target.toUpperCase()}
    </span>
  );
}
