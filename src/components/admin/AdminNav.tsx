"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";
import {
  LogOut,
  Calendar,
  Music,
  Camera,
  Settings,
  Menu,
  X,
  Film,
  PanelLeftClose,
  PanelLeftOpen,
  Feather,
  BarChart3,
  LayoutDashboard,
  UserCircle,
  Briefcase,
  FileText,
  Video,
  BookOpen,
  BookMarked,
  Languages,
  Share2,
  Tv,
  CalendarDays,
  CheckSquare,
  HardDrive,
  Apple,
  Dumbbell,
  NotebookPen,
  Sparkles,
  Wallet,
  Flame,
  Languages as LanguagesIcon,
  Smartphone,
} from "lucide-react";

// ── Dashboard — tek başına üstte ──
const dashboardLink = {
  href: "/secretgate",
  label: "Dashboard",
  icon: LayoutDashboard,
};

// ── İçerik — public siteyi besleyen sayfalar ──
const contentLinks = [
  { href: "/secretgate/planner", label: "Ajanda", icon: Calendar },
  { href: "/secretgate/karalamalar", label: "Karalamalar", icon: Feather },
  { href: "/secretgate/film-dizi", label: "Film & Dizi", icon: Film },
  { href: "/secretgate/diziler", label: "Diziler", icon: Tv },
  { href: "/secretgate/photos", label: "Fotoğraflar", icon: Camera },
  { href: "/secretgate/su-an", label: "Şu an", icon: Music },
  { href: "/secretgate/about", label: "Beni Tanıyın", icon: UserCircle },
  { href: "/secretgate/works", label: "Yaptıklarım", icon: Briefcase },
  { href: "/secretgate/yazilarim", label: "Yazılarım", icon: FileText },
  { href: "/secretgate/plaktaki-kitap", label: "Plaktaki Kitap", icon: Video },
  { href: "/secretgate/reading-log", label: "Okuma günlüğü", icon: BookMarked },
  { href: "/secretgate/translations", label: "Çeviriler", icon: Languages },
  { href: "/secretgate/movie-watch-log", label: "Film günlüğü", icon: Film },
  { href: "/secretgate/series-watch-log", label: "Dizi günlüğü", icon: Tv },
  { href: "/secretgate/reading", label: "Okuma", icon: BookOpen },
  { href: "/secretgate/socials", label: "Bana Ulaşın", icon: Share2 },
];

// ── Kişisel — sadece admin'e özel ──
const personalLinks = [
  { href: "/secretgate/takvim", label: "Takvim", icon: CalendarDays },
  { href: "/secretgate/yapilacaklar", label: "Yapılacaklar", icon: CheckSquare },
  { href: "/secretgate/dosyalar", label: "Dosyalar", icon: HardDrive },
  { href: "/secretgate/beslenme", label: "Beslenme", icon: Apple },
  { href: "/secretgate/spor", label: "Spor", icon: Dumbbell },
  { href: "/secretgate/gunluk", label: "Günlük", icon: NotebookPen },
  { href: "/secretgate/sukur", label: "Şükür", icon: Sparkles },
  { href: "/secretgate/finans", label: "Finans", icon: Wallet },
  { href: "/secretgate/aliskanliklar", label: "Alışkanlıklar", icon: Flame },
  { href: "/secretgate/diller", label: "Diller", icon: LanguagesIcon },
  { href: "/secretgate/icerik", label: "İçerik Planı", icon: Smartphone },
  {
    href: "/secretgate/istatistikler",
    label: "İstatistikler",
    icon: BarChart3,
    soon: true,
  },
];

// ── Ayarlar — tek başına en altta ──
const settingsLink = {
  href: "/secretgate/settings",
  label: "Ayarlar",
  icon: Settings,
};

function isActive(pathname: string, href: string) {
  if (href === "/secretgate") return pathname === "/secretgate";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminNav({
  user,
}: {
  user: User | { isSimpleAuth: true };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isSimpleAuth = "isSimpleAuth" in user && user.isSimpleAuth;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function handleLogout() {
    if (isSimpleAuth) {
      await fetch("/api/admin/logout", { method: "POST" });
    } else {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
    }
    router.push("/secretgate/login");
    router.refresh();
  }

  const NavLink = ({
    link,
  }: {
    link: {
      href: string;
      label: string;
      icon: typeof Calendar;
      soon?: boolean;
    };
  }) => {
    const active = isActive(pathname, link.href);
    if (link.soon) {
      return (
        <span
          title="Yakında"
          className="flex cursor-not-allowed items-center gap-3 rounded-r-xl px-3 py-2.5 text-[#1a1612]/25"
        >
          <link.icon className="h-5 w-5 shrink-0" />
          <span
            className={`min-w-0 truncate text-sm font-light ${
              sidebarOpen ? "hidden lg:group-hover:inline xl:inline" : "hidden"
            }`}
          >
            {link.label}
          </span>
        </span>
      );
    }
    return (
      <Link
        href={link.href}
        onClick={() => setMenuOpen(false)}
        title={link.label}
        className={`group relative flex items-center gap-3 rounded-r-xl px-3 py-2.5 transition-all duration-200 ${
          active
            ? "admin-nav-active text-[#b8934a]"
            : "text-[#1a1612]/55 hover:bg-[#1a1612]/5 hover:text-[#1a1612]"
        }`}
      >
        {active && (
          <span
            className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full"
            style={{
              background: "linear-gradient(180deg, #b8934a, #d4a85a)",
              boxShadow: "0 0 12px rgba(184, 147, 74, 0.4)",
            }}
          />
        )}
        <link.icon className="relative z-10 h-5 w-5 shrink-0" />
        <span
          className={`relative z-10 min-w-0 truncate text-sm font-light ${
            sidebarOpen ? "hidden lg:group-hover:inline xl:inline" : "hidden"
          }`}
        >
          {link.label}
        </span>
      </Link>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Header — toggle + mobile kapat */}
      <div className="flex items-center justify-between border-b border-[#e8e0d4] px-2 py-3 lg:px-3 lg:py-4">
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[#6b6158] hover:bg-[#1a1612]/5 hover:text-[#1a1612]"
          aria-label={sidebarOpen ? "Paneli daralt" : "Paneli genişlet"}
          title={sidebarOpen ? "Paneli daralt" : "Paneli genişlet"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b6158] hover:bg-[#1a1612]/5 hover:text-[#1a1612] lg:hidden"
          aria-label="Menüyü kapat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {/* Dashboard — tek başına */}
        <NavLink link={dashboardLink} />

        <div className="my-2 border-t border-[#e8e0d4] pt-2">
          <p
            className={`mb-1 px-3 text-[9px] font-medium uppercase tracking-[0.14em] text-[#1a1612]/30 ${
              sidebarOpen ? "hidden xl:block" : "hidden"
            }`}
          >
            İçerik
          </p>
          {contentLinks.map((link) => (
            <NavLink key={link.href} link={link} />
          ))}
        </div>

        <div className="my-2 border-t border-[#e8e0d4] pt-2">
          <p
            className={`mb-1 px-3 text-[9px] font-medium uppercase tracking-[0.14em] text-[#1a1612]/30 ${
              sidebarOpen ? "hidden xl:block" : "hidden"
            }`}
          >
            Kişisel
          </p>
          {personalLinks.map((link) => (
            <NavLink key={link.href} link={link} />
          ))}
        </div>
      </nav>

      {/* Footer — Ayarlar + çıkış */}
      <div className="border-t border-[#e8e0d4] px-2 py-3">
        {!isSimpleAuth && sidebarOpen && (
          <p className="mb-2 truncate px-3 text-xs font-light text-[#6b6158]">
            {(user as User).email}
          </p>
        )}
        <NavLink link={settingsLink} />
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-r-xl px-3 py-2.5 text-sm font-light text-[#6b6158] hover:bg-[#1a1612]/5 hover:text-[#1a1612]"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className={sidebarOpen ? "hidden xl:inline" : "hidden"}>
            Çıkış
          </span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-50 hidden h-screen w-[72px] flex-col border-r border-[#e8e0d4] bg-[#faf7f2] shadow-[4px_0_24px_-4px_rgba(26,22,18,0.08)] transition-[width] duration-200 lg:flex ${
          sidebarOpen ? "xl:w-[200px]" : ""
        }`}
      >
        <SidebarContent />
      </aside>

      <div className="fixed left-0 top-0 z-50 flex h-14 w-full items-center justify-between border-b border-[#e8e0d4] bg-[#faf7f2]/95 px-4 backdrop-blur-sm lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#1a1612]/70 hover:bg-[#1a1612]/8"
          aria-label="Menüyü aç"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link
          href="/secretgate"
          className="text-sm font-medium text-[#1a1612]/70 hover:text-[#1a1612]"
        >
          Dashboard
        </Link>
        <button
          onClick={handleLogout}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#1a1612]/70 hover:bg-[#1a1612]/8"
          aria-label="Çıkış"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      <div
        className="fixed inset-0 z-40 bg-[#1a1612]/40 backdrop-blur-sm transition-opacity lg:hidden"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
        onClick={() => setMenuOpen(false)}
        aria-hidden
      />
      <aside
        className="fixed left-0 top-0 z-50 flex h-full w-[260px] max-w-[85vw] flex-col border-r border-[#e8e0d4] bg-[#faf7f2] shadow-2xl transition-transform lg:hidden"
        style={{
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
