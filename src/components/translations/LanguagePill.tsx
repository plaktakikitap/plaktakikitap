"use client";

export function LanguagePill({ source, target }: { source: string; target: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 font-light tracking-widest text-amber-800 dark:bg-amber-400/20 dark:text-amber-200 text-xs">
      {source.toUpperCase()} → {target.toUpperCase()}
    </span>
  );
}
