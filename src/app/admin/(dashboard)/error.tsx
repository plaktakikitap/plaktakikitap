"use client";

import { useEffect } from "react";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isServiceRoleMissing =
    error.message?.includes("SUPABASE_SERVICE_ROLE_KEY") ||
    error.message?.toLowerCase().includes("service_role");

  useEffect(() => {
    console.error("[Admin]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="max-w-lg rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
        <h2 className="text-lg font-semibold text-amber-700 dark:text-amber-400">
          Admin paneli yüklenemedi
        </h2>
        {isServiceRoleMissing ? (
          <div className="mt-4 space-y-3 text-left text-sm text-[var(--muted-foreground)]">
            <p>
              <strong className="text-amber-600 dark:text-amber-500">
                SUPABASE_SERVICE_ROLE_KEY
              </strong>{" "}
              tanımlı değil.
            </p>
            <ol className="list-inside list-decimal space-y-1">
              <li>Supabase Dashboard → Project Settings → API</li>
              <li>
                <code className="rounded bg-black/10 px-1">service_role</code> key&apos;i kopyala
              </li>
              <li>
                Vercel → Proje → Settings → Environment Variables
              </li>
              <li>
                <code className="rounded bg-black/10 px-1">SUPABASE_SERVICE_ROLE_KEY</code> adıyla ekle
              </li>
              <li>Redeploy yap</li>
            </ol>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">{error.message}</p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Tekrar dene
        </button>
      </div>
    </div>
  );
}
