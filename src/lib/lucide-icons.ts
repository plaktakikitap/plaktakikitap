import {
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Podcast,
  Globe,
  type LucideIcon,
} from "lucide-react";

const LUCIDE_ICONS: Record<string, LucideIcon> = {
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  mail: Mail,
  spotify: Podcast,
  podcast: Podcast,
  x: Globe,
  twitter: Globe,
  globe: Globe,
};

export function getLucideIcon(name: string | null): LucideIcon {
  if (!name) return Globe;
  const key = name.toLowerCase().replace(/\s/g, "");
  return LUCIDE_ICONS[key] ?? Globe;
}

export const LUCIDE_ICON_NAMES = ["instagram", "youtube", "linkedin", "mail", "spotify", "podcast", "x", "globe"];
