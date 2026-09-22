import Link from "next/link";
import { ArrowLeft, Tv } from "lucide-react";
import { WatchLogSeriesForm } from "@/components/admin/WatchLogSeriesForm";

export default function AdminSeriesWatchLogPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/secretgate"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#6b6158] transition hover:text-[#1a1612]"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <div className="rounded-2xl border border-[#e8e0d4] bg-[#f0ebe2] p-6 backdrop-blur-sm sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-[#b8934a]">
            <Tv className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1a1612]">
              Dizi izleme günlüğü
            </h1>
            <p className="mt-0.5 text-sm text-[#6b6158]">
              DVD rafı görünümünü besleyen dizi kaydı
            </p>
          </div>
        </div>

        <WatchLogSeriesForm />
      </div>

      <p className="mt-4 text-center text-xs text-[#1a1612]/40">
        Kaydettiğiniz diziler{" "}
        <Link href="/diziler" className="underline hover:text-[#1a1612]/70">
          İzleme günlüğüm → Diziler
        </Link>{" "}
        sayfasında görünür.
      </p>
    </div>
  );
}
