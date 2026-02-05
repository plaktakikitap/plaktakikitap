"use client";

export function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-white/10" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-video rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="h-5 w-3/4 rounded bg-white/10" />
      <div className="mt-2 h-4 w-full rounded bg-white/5" />
      <div className="mt-2 h-4 w-1/2 rounded bg-white/5" />
    </div>
  );
}
