import type { Options } from "canvas-confetti";

const PAPER_COLORS = ["#f3ead9", "#fff7c2", "#c9a65a", "#e8dcc0"];

function originFromElement(element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return {
    x: (rect.left + rect.width / 2) / window.innerWidth,
    y: (rect.top + rect.height / 2) / window.innerHeight,
  };
}

function paperBurst(
  confetti: (options?: Options) => Promise<undefined> | null,
  origin: { x: number; y: number },
  overrides: Partial<Options> = {}
) {
  confetti({
    particleCount: 26,
    spread: 58,
    startVelocity: 26,
    gravity: 1.2,
    scalar: 0.7,
    shapes: ["square"],
    colors: PAPER_COLORS,
    ticks: 140,
    origin,
    disableForReducedMotion: true,
    ...overrides,
  });
}

/** Post-it / kağıt parçacığı efekti — tetikleyici elementin konumundan patlar. */
export function triggerPaperConfetti(originElement: HTMLElement): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  void import("canvas-confetti").then(({ default: confetti }) => {
    const origin = originFromElement(originElement);

    paperBurst(confetti, origin);
    window.setTimeout(() => {
      paperBurst(confetti, origin, {
        particleCount: 14,
        spread: 42,
        startVelocity: 18,
        angle: 108,
      });
    }, 90);
  });
}
