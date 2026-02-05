"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";
import { LayoutDashboard, LogOut, ImageIcon, Calendar, Palette, Music, BookOpen, Link2, Share2, UserCircle, Briefcase, Camera, Video, Settings, Languages, FileText, Menu, X } from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/about", label: "Beni Tanıyın", icon: UserCircle },
  { href: "/admin/works", label: "Yaptıklarım", icon: Briefcase },
  { href: "/admin/yazilarim", label: "Yazılarım", icon: FileText },
  { href: "/admin/photos", label: "Fotoğraf", icon: Camera },
  { href: "/admin/videos", label: "Videolar", icon: Video },
  { href: "/admin/plaktaki-kitap", label: "Plaktaki Kitap", icon: Video },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/planner", label: "Planner", icon: Calendar },
  { href: "/admin/art", label: "Art", icon: Palette },
  { href: "/admin/now-playing", label: "Şu an dinliyorum", icon: Music },
  { href: "/admin/reading", label: "Şu an okuyorum", icon: BookOpen },
  { href: "/admin/reading-log", label: "Okuma günlüğü", icon: BookOpen },
  { href: "/admin/translations", label: "Çeviriler", icon: Languages },
  { href: "/admin/site-links", label: "Site linkleri", icon: Link2 },
  { href: "/admin/socials", label: "Bana Ulaşın", icon: Share2 },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

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

  const linkEl = (link: (typeof adminLinks)[0]) => (
    <Link
      key={link.href}
      href={link.href}
      onClick={() => setMenuOpen(false)}
      className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${
        pathname === link.href
          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
          : "text-[var(--muted)] hover:text-[var(--foreground)]"
      }`}
    >
      <link.icon className="h-4 w-4 shrink-0" />
      <span className="min-w-0 truncate">{link.label}</span>
    </Link>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Link href="/admin" className="shrink-0 font-semibold text-[var(--foreground)]">
              Admin
            </Link>
            {/* Masaüstü: linkler yan yana */}
            <div className="hidden flex-wrap items-center gap-1 md:flex">
              {adminLinks.map((link) => linkEl(link))}
            </div>
            {/* Mobil: hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)] md:hidden"
              aria-label="Menüyü aç"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!isSimpleAuth && (
              <span className="hidden truncate text-sm text-[var(--muted)] max-w-[120px] sm:max-w-[180px] md:inline">
                {(user as User).email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded px-2 py-1 text-sm text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobil menü overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden"
        style={{ opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "auto" : "none" }}
        onClick={() => setMenuOpen(false)}
        aria-hidden
      />
      <aside
        className="fixed top-0 right-0 z-50 flex h-full w-full max-w-[min(320px,85vw)] flex-col border-l border-[var(--card-border)] bg-[var(--background)] shadow-xl transition-transform duration-200 ease-out md:hidden"
        style={{ transform: menuOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
          <span className="font-semibold text-[var(--foreground)]">Menü</span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"
            aria-label="Menüyü kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-0.5">
            {adminLinks.map((link) => linkEl(link))}
          </div>
        </div>
      </aside>
    </>
  );
}
