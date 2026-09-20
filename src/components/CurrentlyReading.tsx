"use client";

import { useState } from "react";
import useSWR from "swr";
import type { ReadingStackPayload, StackBook } from "@/app/api/reading/route";

const PALETTE = ["#8B7B6B", "#6B7B8B", "#7B8B6B"] as const;
const OFFSET = 8;
const BOOK_W = 140;
const BOOK_H = 200;
const TEXT_COLOR = "#4a3728";

const fetcher = async (url: string): Promise<ReadingStackPayload> => {
  const res = await fetch(url);
  if (!res.ok) return { current: null, stack: [] };
  return res.json();
};

function bookColor(book: StackBook, index: number): string {
  const raw = book.spine_color?.trim();
  if (raw && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw)) return raw;
  return PALETTE[index % PALETTE.length]!;
}

/** Minik açık kitap — sayfalar hafifçe uçuşur (CSS only). */
function FlutteringBookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="16"
      viewBox="0 0 18 16"
      fill="none"
      aria-hidden
    >
      {/* Sol sayfa */}
      <path
        d="M9 2.2C7.2 1.2 4.8 1.1 2.5 1.6c-.4.1-.7.4-.7.8v9.2c0 .5.5.8 1 .7 2-.4 4-.3 5.7.6.2.1.5 0 .5-.3V2.5c0-.2-.1-.3-.3-.3z"
        fill="currentColor"
        opacity="0.55"
      />
      {/* Sağ sayfa — hafif flap */}
      <path
        className="currently-reading-page"
        d="M9 2.2C10.8 1.2 13.2 1.1 15.5 1.6c.4.1.7.4.7.8v9.2c0 .5-.5.8-1 .7-2-.4-4-.3-5.7.6-.2.1-.5 0-.5-.3V2.5c0-.2.1-.3.3-.3z"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Ortadaki cilt çizgisi */}
      <path
        d="M9 2.4v10.4"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Uçuşan sayfa parçası */}
      <path
        className="currently-reading-page-fly"
        d="M12.2 3.2c1.4-.2 2.6.1 3.4.6"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

/**
 * Kitap destesi — statik; yalnızca hover ile üst kitap hafifçe kalkar.
 */
export function CurrentlyReading({
  showTopDivider = false,
}: {
  showTopDivider?: boolean;
}) {
  const { data } = useSWR<ReadingStackPayload>("/api/reading", fetcher, {
    revalidateOnFocus: false,
  });
  const [hovered, setHovered] = useState(false);

  const books = (data?.stack ?? []).slice(0, 3);

  if (books.length === 0) return null;

  return (
    <>
      {showTopDivider ? <hr className="section-divider" aria-hidden /> : null}

      <section
        className="currently-reading currently-reading-fade mx-auto w-full max-w-3xl"
        aria-label="Şu an okuyorum"
        style={{ padding: "5rem 2rem" }}
      >
        <div className="flex flex-col items-center justify-center gap-12 md:flex-row md:gap-12">
          <div
            className="flex max-w-[200px] items-start justify-center gap-2 md:justify-start"
          >
            <span style={{ color: TEXT_COLOR }} aria-hidden>
              <FlutteringBookIcon className="mt-1 shrink-0" />
            </span>
            <p
              className="text-center italic md:text-left"
              style={{
                fontFamily:
                  "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                fontSize: "1rem",
                lineHeight: 1.6,
                color: TEXT_COLOR,
              }}
            >
              şu an bunu okuyorum biliyor musunnn
            </p>
          </div>

          <div
            className="relative shrink-0"
            style={{ width: 160, height: 220 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {books.map((book, i) => {
              const depth = i;
              const isTop = i === 0;
              const color = bookColor(book, i);
              const ox = depth * OFFSET;
              const oy = -depth * OFFSET;
              const z = books.length - i;

              const lift = isTop && hovered ? -20 : 0;
              const rotate = isTop && hovered ? -2 : 0;
              const underOpacity = !isTop && hovered ? 1 : !isTop ? 0.7 : 1;

              return (
                <div
                  key={book.id}
                  className="absolute overflow-hidden rounded-lg"
                  style={{
                    width: BOOK_W,
                    height: BOOK_H,
                    left: 10,
                    top: 10,
                    zIndex: z,
                    backgroundColor: color,
                    boxShadow: "0 8px 24px rgba(26,22,18,0.22)",
                    transform: `translate(${ox}px, ${oy + lift}px) rotate(${rotate}deg)`,
                    opacity: underOpacity,
                    transition: "transform 0.4s ease, opacity 0.4s ease",
                  }}
                >
                  <div className="flex h-full flex-col items-center justify-center gap-1.5 px-4 text-center">
                    <span className="font-sans text-[0.85rem] font-medium leading-snug text-white">
                      {book.title}
                    </span>
                    {book.author ? (
                      <span className="font-sans text-[0.75rem] font-normal text-white/70">
                        {book.author}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
