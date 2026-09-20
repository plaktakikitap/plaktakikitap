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

export type NavCardItem = {
  href: string;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  /** RGB virgülle ayrılmış — rgba() glow için */
  accentColor: string;
};

export const NAV_CARDS: NavCardItem[] = [
  {
    href: "/beni-taniyin",
    title: "Beni Tanıyın",
    subtitle: "kimdir bu eymen?",
    Icon: User,
    accentColor: "201,166,90",
  },
  {
    href: "/readings",
    title: "Okuma Günlüğüm",
    subtitle: "altını çizdiklerim, notlarım",
    Icon: BookOpen,
    accentColor: "107,44,44",
  },
  {
    href: "/izleme-gunlugum",
    title: "İzleme Günlüğüm",
    subtitle: "izlediğim diziler, filmler ve onlara olan yorumlarım",
    Icon: Film,
    accentColor: "44,58,74",
  },
  {
    href: "/photos",
    title: "Fotoğraflar",
    subtitle: "benim gözümden dünya",
    Icon: Camera,
    accentColor: "74,58,44",
  },
  {
    href: "/works",
    title: "Yaptıklarım",
    subtitle: "üretimler, projeler",
    Icon: FolderKanban,
    accentColor: "74,90,62",
  },
  {
    href: "/translations",
    title: "Çevirilerim",
    subtitle: "yayınlanmış kitaplarım, gönüllü çevirilerim",
    Icon: Languages,
    accentColor: "90,74,44",
  },
  {
    href: "/plaktaki-kitap",
    title: "Plaktaki Kitap Videoları",
    subtitle: "Plaktaki Kitap",
    Icon: Video,
    accentColor: "44,44,44",
  },
  {
    href: "/writings",
    title: "Yazılarım",
    subtitle: "düşünceler, denemeler, parçalar",
    Icon: FileText,
    accentColor: "74,44,58",
  },
];
