"use client";

import { useState } from "react";
import { usableBookCoverUrl } from "@/lib/book-cover";

export function BookCoverImage({
  src,
  alt,
  className = "h-full w-full object-cover object-center",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const initial = usableBookCoverUrl(src);
  const [failed, setFailed] = useState(false);
  const url = failed ? null : initial;

  if (!url) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
