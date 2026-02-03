"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Mail } from "lucide-react";
import { getLucideIcon } from "@/lib/lucide-icons";
import { ContactModal } from "./ContactModal";

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon_name: string | null;
  is_active: boolean;
  order_index: number;
}

interface SocialLinksSectionProps {
  links: SocialLink[];
}

function MagneticButton({
  children,
  href,
  onClick,
  isSpotify,
  index,
  isVisible,
}: {
  children: React.ReactNode;
  href?: string | null;
  onClick?: () => void;
  isSpotify: boolean;
  index: number;
  isVisible: boolean;
}) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 200 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.2;
    const deltaY = (e.clientY - centerY) * 0.2;
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const baseSize = isSpotify ? "h-12 w-12 md:h-14 md:w-14" : "h-10 w-10 md:h-11 md:w-11";
  const glowColor = isSpotify
    ? "group-hover:shadow-[0_0_28px_rgba(251,191,36,0.4)] group-hover:border-amber-400/60"
    : "group-hover:shadow-[0_0_20px_rgba(251,191,36,0.25)] group-hover:border-amber-400/50";

  const content = (
    <motion.span
      style={{ x: springX, y: springY }}
      className={`flex ${baseSize} items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 ${glowColor}`}
    >
      {children}
    </motion.span>
  );

  if (onClick) {
    return (
      <motion.button
        ref={ref as React.RefObject<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, x: -16 }}
        animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
        transition={{ duration: 0.4, delay: index * 0.06 }}
        className="group flex shrink-0"
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.a
      ref={ref as React.RefObject<HTMLAnchorElement>}
      href={href ?? "#"}
      target="_blank"
      rel="noreferrer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, x: -16 }}
      animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group flex shrink-0 text-white/90"
    >
      {content}
    </motion.a>
  );
}

export function SocialLinksSection({ links }: SocialLinksSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);
  const [mailUrl, setMailUrl] = useState<string | undefined>();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => setIsVisible(e.isIntersecting),
      { rootMargin: "60px 0px 0px 0px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const activeLinks = links
    .filter((l) => l.is_active)
    .sort((a, b) => a.order_index - b.order_index);

  // Link yoksa varsayılan mail butonu
  const showDefaultMail = activeLinks.length === 0;

  return (
    <>
      <div ref={ref} className="flex items-center gap-2">
        <span className="mr-2 text-xs text-white/40">Bana ulaşın</span>
        <div className="flex items-center gap-2">
          {showDefaultMail && (
            <MagneticButton
              onClick={() => setMailOpen(true)}
              isSpotify={false}
              index={0}
              isVisible={isVisible}
            >
              <Mail className="h-5 w-5" strokeWidth={1.8} />
            </MagneticButton>
          )}
          {activeLinks.map((link, i) => {
            const Icon = getLucideIcon(link.icon_name ?? link.platform);
            const isMail = link.platform.toLowerCase() === "mail";
            const isSpotify = link.platform.toLowerCase() === "spotify";

            if (isMail) {
              return (
                <MagneticButton
                  key={link.id}
                  onClick={() => {
                    setMailUrl(link.url?.replace(/^mailto:/i, "").trim() || undefined);
                    setMailOpen(true);
                  }}
                  isSpotify={false}
                  index={i}
                  isVisible={isVisible}
                >
                  <Icon className="h-5 w-5 md:h-5 md:w-5" strokeWidth={1.8} />
                </MagneticButton>
              );
            }

            return (
              <MagneticButton
                key={link.id}
                href={link.url}
                isSpotify={isSpotify}
                index={i}
                isVisible={isVisible}
              >
                <Icon
                  className={
                    isSpotify ? "h-6 w-6 md:h-7 md:w-7" : "h-5 w-5 md:h-5 md:w-5"
                  }
                  strokeWidth={1.8}
                />
              </MagneticButton>
            );
          })}
        </div>
      </div>

      <ContactModal
        isOpen={mailOpen}
        onClose={() => setMailOpen(false)}
        mailTo={mailUrl}
      />
    </>
  );
}
