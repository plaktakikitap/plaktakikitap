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
};

export const NAV_CARDS: NavCardItem[] = [
  {
    href: "/beni-taniyin",
    title: "Beni Tanıyın",
    subtitle: "kimdir bu eymen?",
    Icon: User,
  },
  {
    href: "/readings",
    title: "Okuma Günlüğüm",
    subtitle: "altını çizdiklerim, notlarım",
    Icon: BookOpen,
  },
  {
    href: "/izleme-gunlugum",
    title: "İzleme Günlüğüm",
    subtitle: "izlediğim diziler, filmler ve onlara olan yorumlarım",
    Icon: Film,
  },
  {
    href: "/photos",
    title: "Fotoğraflar",
    subtitle: "benim gözümden dünya",
    Icon: Camera,
  },
  {
    href: "/works",
    title: "Yaptıklarım",
    subtitle: "üretimler, projeler",
    Icon: FolderKanban,
  },
  {
    href: "/translations",
    title: "Çevirilerim",
    subtitle: "yayınlanmış kitaplarım, gönüllü çevirilerim",
    Icon: Languages,
  },
  {
    href: "/plaktaki-kitap",
    title: "Plaktaki Kitap Videoları",
    subtitle: "Plaktaki Kitap",
    Icon: Video,
  },
  {
    href: "/writings",
    title: "Yazılarım",
    subtitle: "düşünceler, denemeler, parçalar",
    Icon: FileText,
  },
];
