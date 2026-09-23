import {
  User,
  FolderKanban,
  FileText,
  BookOpen,
  Film,
  Languages,
  Camera,
  Video,
  type LucideIcon,
} from "lucide-react";

export type NavCardVisual =
  | "about"
  | "reading"
  | "cinema"
  | "photos"
  | "works"
  | "translations"
  | "plaktaki"
  | "writings";

export type NavCardItem = {
  href: string;
  title: string;
  subtitle: string;
  /** Lucide — vinyl stage not kartları için */
  Icon: LucideIcon;
  visual: NavCardVisual;
  /** Bento: 2 kolon (featured) */
  featured?: boolean;
  /** RGB virgülle ayrılmış — rgba() glow için */
  accentColor: string;
};

export const NAV_CARDS: NavCardItem[] = [
  {
    href: "/beni-taniyin",
    title: "Beni Tanıyın",
    subtitle: "kimdir bu eymen?",
    Icon: User,
    visual: "about",
    featured: true,
    accentColor: "184,147,74",
  },
  {
    href: "/readings",
    title: "Okuma Günlüğüm",
    subtitle: "altını çizdiklerim, notlarım",
    Icon: BookOpen,
    visual: "reading",
    accentColor: "107,44,44",
  },
  {
    href: "/izleme-gunlugum",
    title: "İzleme Günlüğüm",
    subtitle: "izlediğim diziler, filmler ve onlara olan yorumlarım",
    Icon: Film,
    visual: "cinema",
    accentColor: "44,58,74",
  },
  {
    href: "/photos",
    title: "Fotoğraflar",
    subtitle: "benim gözümden dünya",
    Icon: Camera,
    visual: "photos",
    accentColor: "74,58,44",
  },
  {
    href: "/works",
    title: "Yaptıklarım",
    subtitle: "üretimler, projeler",
    Icon: FolderKanban,
    visual: "works",
    accentColor: "74,90,62",
  },
  {
    href: "/translations",
    title: "Çevirilerim",
    subtitle: "yayınlanmış kitaplarım, gönüllü çevirilerim",
    Icon: Languages,
    visual: "translations",
    accentColor: "90,74,44",
  },
  {
    href: "/plaktaki-kitap",
    title: "Plaktaki Kitap Videoları",
    subtitle: "Plaktaki Kitap",
    Icon: Video,
    visual: "plaktaki",
    accentColor: "44,44,44",
  },
  {
    href: "/writings",
    title: "Yazılarım",
    subtitle: "düşünceler, denemeler, parçalar",
    Icon: FileText,
    visual: "writings",
    accentColor: "74,44,58",
  },
];
