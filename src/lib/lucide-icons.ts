import {
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Music2,
  Globe,
  type LucideIcon,
} from "lucide-react";

const LUCIDE_ICONS: Record<string, LucideIcon> = {
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  mail: Mail,
  spotify: Music2,
  music2: Music2,
  x: Globe, // X/Twitter – Lucide'da yok, Globe fallback
  twitter: Globe,
  globe: Globe,
};

export function getLucideIcon(name: string | null): LucideIcon {
  if (!name) return Globe;
  const key = name.toLowerCase().replace(/\s/g, "");
  return LUCIDE_ICONS[key] ?? Globe;
}

export const LUCIDE_ICON_NAMES = ["instagram", "youtube", "linkedin", "mail", "spotify", "x", "globe"];
