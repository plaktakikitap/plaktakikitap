"use client";

import { useState } from "react";
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
import { ContactModal } from "./ContactModal";

/** X (Twitter) SVG — Lucide'da marka ikonu yok */
function XIcon({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" aria-hidden>
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
  onClick,
  isSpotify,
  children,
  isSkeleton = false,
}: {
  href?: string | null;
  onClick?: () => void;
  isSpotify: boolean;
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

  if (onClick) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        className="!flex !h-10 !w-10 !shrink-0 !rounded-xl !border-0 !bg-transparent !p-0 md:!h-11 md:!w-11"
        disabled={isSkeleton}
        aria-label={isSkeleton ? undefined : "İletişim"}
        {...motionProps}
      >
        {inner}
      </motion.button>
    );
  }

  return (
    <motion.a
      href={isSkeleton ? "#" : (href ?? "#")}
      target="_blank"
      rel="noreferrer"
      className="!flex !h-10 !w-10 !shrink-0 !rounded-xl !no-underline !text-white/90 md:!h-11 md:!w-11"
      aria-label={isSkeleton ? undefined : "Sosyal medya"}
      {...motionProps}
    >
      {inner}
    </motion.a>
  );
}

export function SocialLinksSection({ links }: SocialLinksSectionProps) {
  const [mailOpen, setMailOpen] = useState(false);
  const [mailUrl, setMailUrl] = useState<string | undefined>();

  const activeLinks = links
    .filter((l) => l.is_active)
    .sort((a, b) => a.order_index - b.order_index);

  const showDefault = activeLinks.length === 0;
  const items = showDefault
    ? DEFAULT_PLATFORMS.map((p, i) => ({
        id: `default-${i}`,
        platform: p.platform,
        url: "#",
        icon: p.icon,
        isMail: p.platform === "mail",
        isSpotify: p.platform === "spotify",
        onClick: p.platform === "mail" ? () => setMailOpen(true) : undefined,
        isSkeleton: true,
      }))
    : activeLinks.map((link) => {
        const iconOrName = link.icon_name ?? link.platform;
        const key = iconOrName.toLowerCase();
        const Icon = key === "x" || key === "twitter" ? XIcon : getLucideIcon(iconOrName);
        const isMail = link.platform.toLowerCase() === "mail";
        const isSpotify = link.platform.toLowerCase() === "spotify";

        return {
          id: link.id,
          platform: link.platform,
          url: link.url,
          icon: Icon,
          isMail,
          isSpotify,
          onClick: isMail
            ? () => {
                setMailUrl(link.url?.replace(/^mailto:/i, "").trim() || undefined);
                setMailOpen(true);
              }
            : undefined,
          isSkeleton: false,
        };
      });

  return (
    <>
      <div className="!flex !items-center !justify-end !gap-3">
        <span className="!text-xs !text-white/40">Bana ulaşın</span>
        <div className="!flex !flex-wrap !items-center !justify-end !gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <SocialButton
                key={item.id}
                href={item.isMail ? undefined : item.url}
                onClick={item.onClick}
                isSpotify={item.isSpotify}
                isSkeleton={item.isSkeleton}
              >
                <Icon className="!h-5 !w-5 md:!h-5 md:!w-5" strokeWidth={1.8} size={20} />
              </SocialButton>
            );
          })}
        </div>
      </div>

      <ContactModal isOpen={mailOpen} onClose={() => setMailOpen(false)} mailTo={mailUrl} />
    </>
  );
}
