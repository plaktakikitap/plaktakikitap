"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";
import { LayoutDashboard, LogOut, ImageIcon, Calendar, Palette, Music, BookOpen, Link2, Share2, UserCircle, Briefcase } from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/about", label: "Beni Tanıyın", icon: UserCircle },
  { href: "/admin/works", label: "Yaptıklarım", icon: Briefcase },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/planner", label: "Planner", icon: Calendar },
  { href: "/admin/art", label: "Art", icon: Palette },
  { href: "/admin/now-playing", label: "Şu an dinliyorum", icon: Music },
  { href: "/admin/reading", label: "Şu an okuyorum", icon: BookOpen },
  { href: "/admin/site-links", label: "Site linkleri", icon: Link2 },
  { href: "/admin/socials", label: "Bana Ulaşın", icon: Share2 },
];

export function AdminNav({
  user,
}: {
  user: User | { isSimpleAuth: true };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isSimpleAuth = "isSimpleAuth" in user && user.isSimpleAuth;

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="font-semibold text-[var(--foreground)]">
            Admin
          </Link>
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${
                pathname === link.href
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {!isSimpleAuth && (
            <span className="text-sm text-[var(--muted)]">{(user as User).email}</span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 rounded px-2 py-1 text-sm text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"
          >
            <LogOut className="h-4 w-4" />
            Çıkış
          </button>
        </div>
      </div>
    </nav>
  );
}
