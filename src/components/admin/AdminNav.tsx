"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  LogOut,
  Calendar,
  Music,
  BookOpen,
  Share2,
  UserCircle,
  Briefcase,
  Camera,
  Video,
  Settings,
  Languages,
  FileText,
  Menu,
  X,
  BookMarked,
  Film,
  Tv,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/about", label: "Beni Tanıyın", icon: UserCircle },
  { href: "/admin/works", label: "Yaptıklarım", icon: Briefcase },
  { href: "/admin/yazilarim", label: "Yazılarım", icon: FileText },
  { href: "/admin/photos", label: "Fotoğraf", icon: Camera },
  { href: "/admin/plaktaki-kitap", label: "Plaktaki Kitap", icon: Video },
  { href: "/admin/planner", label: "Planner", icon: Calendar },
  { href: "/admin/movie-watch-log", label: "Film izleme günlüğü", icon: Film },
  { href: "/admin/series-watch-log", label: "Dizi izleme günlüğü", icon: Tv },
  { href: "/admin/now-playing", label: "Şu an dinliyorum", icon: Music },
  { href: "/admin/reading", label: "Şu an okuyorum", icon: BookOpen },
  { href: "/admin/reading-log", label: "Okuma günlüğü", icon: BookMarked },
  { href: "/admin/translations", label: "Çeviriler", icon: Languages },
  { href: "/admin/socials", label: "Bana Ulaşın", icon: Share2 },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
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
    router.push("/admin/login");
    router.refresh();
  }

  const NavLink = ({ link }: { link: (typeof adminLinks)[0] }) => {
    const active = isActive(pathname, link.href);
    return (
      <Link
        href={link.href}
        onClick={() => setMenuOpen(false)}
        title={link.label}
        className={`group relative flex items-center gap-3 rounded-r-xl px-3 py-2.5 transition-all duration-200 ${
          active
            ? "admin-nav-active text-amber-400"
            : "text-white/60 hover:text-white/90 hover:bg-white/5"
        }`}
      >
        {active && (
          <span
            className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full"
            style={{
              background: "linear-gradient(180deg, #d4af37, #f4d03f)",
              boxShadow: "0 0 16px rgba(212, 175, 55, 0.6)",
            }}
          />
        )}
        <link.icon
          className={`relative z-10 shrink-0 ${active ? "h-5 w-5" : "h-5 w-5"}`}
        />
        <span className="relative z-10 hidden min-w-0 truncate text-sm font-light lg:group-hover:inline xl:inline">
          {link.label}
        </span>
      </Link>
    );
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-4">
        <Link
          href="/admin"
          className="admin-heading font-semibold tracking-tight text-white"
        >
          <span className="hidden xl:inline">Command Center</span>
          <span className="xl:hidden">CC</span>
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Menüyü kapat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {adminLinks.map((link) => (
          <NavLink key={link.href} link={link} />
        ))}
      </nav>
      <div className="border-t border-white/10 px-2 py-3">
        {!isSimpleAuth && (
          <p className="mb-2 truncate px-3 text-xs font-light text-white/50">
            {(user as User).email}
          </p>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-r-xl px-3 py-2.5 text-sm font-light text-white/60 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="hidden xl:inline">Çıkış</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Sabit sol sidebar — ikon odaklı, glassmorphism */}
      <aside
        className="fixed left-0 top-0 z-50 hidden h-screen w-[72px] flex-col border-r border-white/10 bg-black/30 shadow-[4px_0_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-xl xl:w-[200px] lg:flex"
      >
        <SidebarContent />
      </aside>

      {/* Mobil: hamburger + overlay sidebar */}
      <div className="fixed left-0 top-0 z-50 flex h-14 w-full items-center justify-between border-b border-white/10 bg-black/40 px-4 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10"
          aria-label="Menüyü aç"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/admin" className="admin-heading font-semibold text-white">
          Command Center
        </Link>
        <button
          onClick={handleLogout}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10"
          aria-label="Çıkış"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
        onClick={() => setMenuOpen(false)}
        aria-hidden
      />
      <aside
        className="fixed left-0 top-0 z-50 flex h-full w-[260px] max-w-[85vw] flex-col border-r border-white/10 bg-black/70 shadow-2xl backdrop-blur-xl transition-transform lg:hidden"
        style={{
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
