"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
  type Transition,
  type TargetAndTransition,
} from "framer-motion";

const PIN_THRESHOLD = 0.3;
const SCROLL_END = 0.3;
const MOBILE_FADE_END = 0.2;

type HeroScrollFrameProps = {
  children: ReactNode;
  scrollYProgress: MotionValue<number>;
  enabled: boolean;
  isMobile: boolean;
  className?: string;
  entryInitial?: TargetAndTransition | false;
  entryAnimate?: TargetAndTransition;
  entryTransition?: Transition;
};

export function HeroScrollFrame({
  children,
  scrollYProgress,
  enabled,
  isMobile,
  className = "",
  entryInitial = false,
  entryAnimate,
  entryTransition,
}: HeroScrollFrameProps) {
  const targetXRef = useRef(0);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (!enabled || isMobile) return;

    const updateTargetX = () => {
      targetXRef.current = -window.innerWidth / 2 + 80;
    };

    updateTargetX();
    window.addEventListener("resize", updateTargetX);
    return () => window.removeEventListener("resize", updateTargetX);
  }, [enabled, isMobile]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (!enabled || isMobile) return;
    const pinned = value >= PIN_THRESHOLD;
    setIsPinned((prev) => (prev === pinned ? prev : pinned));
  });

  const scale = useTransform(scrollYProgress, [0, SCROLL_END], [1, 0.35]);
  const x = useTransform(scrollYProgress, (progress) => {
    const t = Math.min(Math.max(progress / SCROLL_END, 0), 1);
    return t * targetXRef.current;
  });
  const y = useTransform(scrollYProgress, [0, SCROLL_END], [0, -300]);
  const mobileOpacity = useTransform(
    scrollYProgress,
    [0, MOBILE_FADE_END],
    [1, 0]
  );

  const handlePinnedClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!enabled) {
    return (
      <motion.div
        initial={entryInitial}
        animate={entryAnimate}
        transition={entryTransition}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  if (isMobile) {
    return (
      <motion.div
        initial={entryInitial}
        animate={entryAnimate}
        transition={entryTransition}
        className={className}
        style={{ opacity: mobileOpacity }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={entryInitial}
      animate={entryAnimate}
      transition={entryTransition}
      className={className}
      style={{
        minHeight: isPinned ? "280px" : undefined,
      }}
    >
      <motion.div
        style={
          isPinned
            ? {
                position: "fixed",
                top: 16,
                left: 16,
                zIndex: 50,
                scale: 0.35,
              }
            : {
                scale,
                x,
                y,
              }
        }
        onClick={isPinned ? handlePinnedClick : undefined}
        onKeyDown={
          isPinned
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handlePinnedClick();
                }
              }
            : undefined
        }
        role={isPinned ? "button" : undefined}
        tabIndex={isPinned ? 0 : undefined}
        aria-label={isPinned ? "Ana sayfanın başına dön" : undefined}
        className={isPinned ? "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#c9a65a]/50" : undefined}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
