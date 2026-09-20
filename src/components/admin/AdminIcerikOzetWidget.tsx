import Link from "next/link";
import { Smartphone } from "lucide-react";
import { getIcDashboardStats } from "@/lib/icerik";

export async function AdminIcerikOzetWidget() {
  let stats: Awaited<ReturnType<typeof getIcDashboardStats>> | null = null;
  try {
    stats = await getIcDashboardStats();
  } catch {
    return null;
  }
  if (!stats) return null;

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-white/80">
          <Smartphone className="h-4 w-4 text-amber-400" />
          İçerik özeti
        </h2>
        <Link
          href="/secretgate/icerik"
          className="text-xs text-amber-300/80 hover:text-amber-200"
        >
          Panele git →
        </Link>
      </div>

      <p className="text-sm text-white/65">
        Bu hafta:{" "}
        <span className="text-white/90">{stats.weekPlanned}</span> planlandı,{" "}
        <span className="text-white/90">{stats.weekShared}</span> paylaşıldı
      </p>

      {stats.todayPlanned.length > 0 ? (
        <div className="mt-3">
          <p className="text-[11px] uppercase tracking-wider text-white/40">
            Bugün planlanmış
          </p>
          <ul className="mt-1.5 space-y-1">
            {stats.todayPlanned.slice(0, 5).map((i) => (
              <li key={i.id} className="truncate text-sm text-white/70">
                <span
                  className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: i.hesap_renk }}
                />
                {i.baslik}
                <span className="ml-1 text-white/35">· {i.hesap_ad}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 text-xs text-white/35">Bugün planlanmış içerik yok.</p>
      )}

      {stats.overdue.length > 0 ? (
        <p className="mt-3 text-sm text-rose-300/80">
          Geciken: {stats.overdue.length} içerik
        </p>
      ) : null}
    </section>
  );
}
