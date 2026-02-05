"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { setFilmFavorite, setSeriesFavorite } from "@/app/actions";

interface FavoriteToggleProps {
  contentId: string;
  type: "film" | "series";
  isFavorite: boolean;
  className?: string;
}

export function FavoriteToggle({ contentId, type, isFavorite, className }: FavoriteToggleProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      if (type === "film") {
        await setFilmFavorite(contentId, !isFavorite);
      } else {
        await setSeriesFavorite(contentId, !isFavorite);
      }
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      title={isFavorite ? "Favorilerden çıkar" : "Eymen'in Favorisi yap"}
      className={
        className ??
        "rounded p-1.5 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)] disabled:opacity-50"
      }
      aria-pressed={isFavorite}
    >
      <Star
        className={`h-4 w-4 ${isFavorite ? "fill-amber-400 text-amber-500" : ""}`}
        aria-hidden
      />
    </button>
  );
}
