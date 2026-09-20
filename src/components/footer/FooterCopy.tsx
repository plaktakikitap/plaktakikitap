"use client";

/** Footer metni — krem zeminde mürekkep tonu */
export function FooterCopy({ children }: { children: React.ReactNode }) {
  return (
    <div className="type-4 font-light tracking-[0.2em] text-ink-muted">
      {children}
    </div>
  );
}
