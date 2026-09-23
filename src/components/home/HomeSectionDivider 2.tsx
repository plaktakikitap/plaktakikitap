import { cn } from "@/lib/utils";

/** Bölümler arası ince ayırıcı — 120px, ton farkı */
export function HomeSectionDivider({ className }: { className?: string }) {
  return (
    <hr
      aria-hidden
      className={cn("section-divider", className)}
    />
  );
}
