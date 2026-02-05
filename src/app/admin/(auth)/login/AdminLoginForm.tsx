"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setLoading(false);
      if (signInError.message.toLowerCase().includes("email not confirmed")) {
        setError(
          "E-posta henüz doğrulanmamış. Supabase Dashboard > Authentication > Providers > Email bölümünden \"Confirm email\" ayarını kapatın veya e-postanızdaki doğrulama linkine tıklayın."
        );
      } else {
        setError(signInError.message);
      }
      return;
    }
    const res = await fetch("/api/admin/check-access");
    const data = await res.json();
    if (data.ok) {
      router.push("/admin");
      router.refresh();
      return;
    }
    await supabase.auth.signOut();
    setError("Bu e-posta adresi ile admin girişi yetkisi yok.");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-white/90"
        >
          E-posta
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="eymenyalaz@hotmail.com"
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/30"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-white/90"
        >
          Şifre
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/30"
        />
      </div>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-white py-3 font-medium text-black hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Giriş yapılıyor..." : "Giriş yap"}
      </button>
    </form>
  );
}
