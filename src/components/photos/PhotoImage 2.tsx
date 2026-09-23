"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

type PhotoImageProps = Omit<ImageProps, "onError" | "alt"> & {
  alt: string;
};

/** next/image with a muted fallback when the remote src fails. */
export function PhotoImage({ alt, className, ...props }: PhotoImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !props.src) {
    return (
      <span
        className={`flex items-center justify-center bg-ink/5 text-center text-xs text-ink/40 ${className ?? ""}`}
        style={
          "fill" in props && props.fill
            ? { position: "absolute", inset: 0 }
            : {
                width: typeof props.width === "number" ? props.width : "100%",
                minHeight: typeof props.height === "number" ? props.height : 200,
                aspectRatio:
                  typeof props.width === "number" && typeof props.height === "number"
                    ? `${props.width} / ${props.height}`
                    : undefined,
              }
        }
        role="img"
        aria-label={alt || "Fotoğraf yüklenemedi"}
      >
        Fotoğraf yüklenemedi
      </span>
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
