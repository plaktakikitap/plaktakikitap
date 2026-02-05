export function AdminSetupRequired() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-8">
        <h2 className="text-xl font-semibold text-amber-700 dark:text-amber-400">
          Admin paneli için yapılandırma gerekli
        </h2>
        <p className="mt-2 text-[var(--muted-foreground)]">
          <code className="rounded bg-black/10 px-1 dark:bg-white/10">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          environment variable tanımlı değil. Bu key olmadan admin paneli çalışamaz.
        </p>
        <ol className="mt-6 list-inside list-decimal space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>
            <strong>Supabase Dashboard</strong> → Proje seç → Project Settings → API
          </li>
          <li>
            <code className="rounded bg-black/10 px-1 dark:bg-white/10">service_role</code> (secret)
            anahtarını kopyala — anon key değil
          </li>
          <li>
            <strong>Vercel</strong> → Proje → Settings → Environment Variables
          </li>
          <li>
            İsim: <code className="rounded bg-black/10 px-1 dark:bg-white/10">SUPABASE_SERVICE_ROLE_KEY</code>
          </li>
          <li>Value: kopyaladığın service_role key</li>
          <li>Deployments → Redeploy yap</li>
        </ol>
      </div>
    </div>
  );
}
