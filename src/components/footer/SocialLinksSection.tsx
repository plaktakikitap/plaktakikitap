"use client";

import { motion } from "framer-motion";
import {
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Podcast,
  type LucideIcon,
} from "lucide-react";
import { getLucideIcon } from "@/lib/lucide-icons";

const DEFAULT_MAIL = "plaktakikitap@gmail.com";

function resolveMailHref(url?: string): string {
  const address = url?.replace(/^mailto:/i, "").trim() || DEFAULT_MAIL;
  return `mailto:${address}`;
}

/** X (Twitter) marka ikonu — Lucide'da yok, kendi SVG */
function XIcon({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-label="X (Twitter)"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

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

/** Varsayılan platformlar — veri gelmezse skeleton göster */
const DEFAULT_PLATFORMS: { platform: string; icon: LucideIcon | typeof XIcon }[] = [
  { platform: "instagram", icon: Instagram },
  { platform: "x", icon: XIcon },
  { platform: "linkedin", icon: Linkedin },
  { platform: "youtube", icon: Youtube },
  { platform: "spotify", icon: Podcast },
  { platform: "mail", icon: Mail },
];

/** Altın glow — rgba(212, 175, 55, 0.4) */
const GOLD_GLOW = "0 0 20px rgba(212, 175, 55, 0.4)";
/** Spotify — yeşilimsi altın */
const SPOTIFY_GLOW = "0 0 24px rgba(30, 215, 96, 0.35), 0 0 20px rgba(212, 175, 55, 0.25)";

function SocialButton({
  href,
  isSpotify,
  isMail = false,
  children,
  isSkeleton = false,
}: {
  href?: string | null;
  isSpotify: boolean;
  isMail?: boolean;
  children: React.ReactNode;
  isSkeleton?: boolean;
}) {
  const glowStyle = isSpotify ? SPOTIFY_GLOW : GOLD_GLOW;
  const motionProps = {
    whileHover: { scale: 1.1, y: -5, boxShadow: glowStyle } as const,
    whileTap: { scale: 0.95 } as const,
  };
  const inner = (
    <div
      className="!flex !h-10 !w-10 !cursor-pointer !items-center !justify-center !rounded-xl !border !border-[rgba(212,175,55,0.2)] !bg-white/5 !backdrop-blur-md !text-white/80 transition-all duration-300 hover:!border-[rgba(212,175,55,0.5)] hover:!text-white hover:!opacity-100 md:!h-11 md:!w-11"
      style={{ boxShadow: "none" }}
    >
      {children}
    </div>
  );

  if (isSkeleton) {
    return (
      <div
        className="!flex !h-10 !w-10 !shrink-0 !cursor-not-allowed !opacity-40 md:!h-11 md:!w-11"
        aria-hidden
      >
        {inner}
      </div>
    );
  }

  return (
    <motion.a
      href={href ?? "#"}
      target={isMail ? undefined : "_blank"}
      rel={isMail ? undefined : "noreferrer"}
      className="!flex !h-10 !w-10 !shrink-0 !rounded-xl !no-underline !text-white/90 md:!h-11 md:!w-11"
      aria-label={isMail ? "E-posta gönder" : "Sosyal medya"}
      {...motionProps}
    >
      {inner}
    </motion.a>
  );
}

export function SocialLinksSection({ links }: SocialLinksSectionProps) {
  const activeLinks = links
    .filter((l) => l.is_active)
    .sort((a, b) => a.order_index - b.order_index);

  const showDefault = activeLinks.length === 0;
  const items = showDefault
    ? DEFAULT_PLATFORMS.map((p, i) => {
        const isMail = p.platform === "mail";
        return {
          id: `default-${i}`,
          platform: p.platform,
          url: isMail ? resolveMailHref() : "#",
          icon: p.icon,
          isMail,
          isSpotify: p.platform === "spotify",
          isSkeleton: !isMail,
        };
      })
    : activeLinks.map((link) => {
        const iconOrName = link.icon_name ?? link.platform;
        const key = (iconOrName ?? "").toLowerCase().trim();
        const isX = key === "x" || key === "twitter" || key === "x.com" || key.replace(/[^a-z]/g, "") === "x";
        const Icon = isX ? XIcon : getLucideIcon(iconOrName);
        const isMail = link.platform.toLowerCase() === "mail";
        const isSpotify = link.platform.toLowerCase() === "spotify";

        return {
          id: link.id,
          platform: link.platform,
          url: isMail ? resolveMailHref(link.url) : link.url,
          icon: Icon,
          isMail,
          isSpotify,
          isSkeleton: false,
        };
      });

  return (
    <div className="!flex !items-center !justify-end !gap-3">
      <span className="!text-xs !text-white/40">Bana ulaşın</span>
      <div className="!flex !flex-wrap !items-center !justify-end !gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <SocialButton
              key={item.id}
              href={item.url}
              isMail={item.isMail}
              isSpotify={item.isSpotify}
              isSkeleton={item.isSkeleton}
            >
              <Icon className="!h-5 !w-5 md:!h-5 md:!w-5" strokeWidth={1.8} size={20} />
            </SocialButton>
          );
        })}
      </div>
    </div>
  );
}
