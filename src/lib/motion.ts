/**
 * Design system: short, snappy motion. No heavy parallax.
 */

export const motionFast = {
  duration: 0.15,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

export const motionBase = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

export const motionStagger = (i: number) => ({
  delay: 0.02 + i * 0.02,
  duration: 0.18,
  ease: [0.25, 0.1, 0.25, 1] as const,
});
