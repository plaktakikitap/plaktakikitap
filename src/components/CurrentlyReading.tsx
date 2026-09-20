"use client";

import Image from "next/image";
import { useState } from "react";
import useSWR from "swr";
import type { CurrentlyReadingBook } from "@/app/api/reading/route";

const fetcher = async (url: string): Promise<CurrentlyReadingBook | null> => {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
};

function initials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toLocaleUpperCase("tr-TR") ?? "")
    .join("");
}

export function CurrentlyReading() {
  const { data } = useSWR<CurrentlyReadingBook | null>("/api/reading", fetcher, {
    revalidateOnFocus: false,
  });
  const [broken, setBroken] = useState(false);

  if (!data?.title) return null;

  const showImg = !!data.cover && !broken;

  return (
    <section
      className="mx-auto flex w-full max-w-[200px] flex-col items-center px-4 py-3"
      aria-label="Şu an okuyorum"
    >
      <p className="mb-3 text-center text-[0.58rem] font-medium uppercase tracking-[0.28em] text-[rgba(154,148,136,0.65)]">
        şu an okuyorum:
      </p>

      <div className="currently-reading-cover relative w-full overflow-hidden rounded-[3px] bg-[#1a1a2e]">
        {showImg ? (
          <Image
            src={data.cover!}
            alt=""
            fill
            className="object-cover"
            sizes="200px"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]">
            <span
              className="font-editorial text-[2.4rem] font-medium tracking-[0.06em] text-[rgba(232,224,208,0.55)]"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
              aria-hidden
            >
              {initials(data.title) || "—"}
            </span>
          </div>
        )}
      </div>

      <h3
        className="mt-3.5 text-center font-editorial text-[1rem] leading-snug text-white"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        {data.title}
      </h3>
      <p className="mt-1 text-center text-[0.75rem] text-[rgba(154,148,136,0.7)]">
        {data.author}
      </p>

      {data.note ? (
        <>
          <div
            aria-hidden
            className="my-2.5 h-px w-10 bg-[rgba(154,148,136,0.35)]"
          />
          <p className="text-center text-[0.68rem] italic leading-snug text-[rgba(154,148,136,0.6)]">
            {data.note}
          </p>
        </>
      ) : null}
    </section>
  );
}
