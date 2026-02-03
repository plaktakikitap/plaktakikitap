"use client";

/**
 * Spiral tel + cilt gölgesi — daha metal görünüm, 12–14 halka, eşit aralık
 */
export function Binding() {
  const ringCount = 14;

  return (
    <div
      className="relative h-full w-full"
      style={{
        background:
          "linear-gradient(90deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.07) 40%, rgba(0,0,0,0.07) 60%, rgba(0,0,0,0.18) 100%)",
      }}
      aria-hidden
    >
      {/* Spiral halkalar — eşit aralık, 14 adet */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-evenly py-2"
      >
        {Array.from({ length: ringCount }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 w-3 shrink-0 rounded-full"
            style={{
              background:
                "linear-gradient(145deg, #b8b8b8 0%, #e0e0e0 25%, #f5f5f5 50%, #c8c8c8 75%, #9a9a9a 100%)",
              boxShadow:
                "inset 0 1px 1px rgba(255,255,255,0.6), inset 0 -1px 1px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
