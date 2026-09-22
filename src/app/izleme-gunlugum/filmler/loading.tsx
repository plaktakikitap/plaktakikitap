export default function Loading() {
  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 h-4 w-32 animate-pulse rounded bg-ink/10" />
        <div className="mb-4 h-8 w-48 animate-pulse rounded bg-ink/10" />
        <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-ink/10" />
          ))}
        </div>
      </div>
    </div>
  );
}
