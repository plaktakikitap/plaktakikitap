import Link from "next/link";
import { ArrowLeft, Film } from "lucide-react";
import { WatchLogMovieForm } from "@/components/admin/WatchLogMovieForm";

export default function AdminMovieWatchLogPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white/90"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <Film className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Film izleme günlüğü
            </h1>
            <p className="mt-0.5 text-sm text-white/60">
              DVD rafı görünümünü besleyen film kaydı
            </p>
          </div>
        </div>

        <WatchLogMovieForm />
      </div>

      <p className="mt-4 text-center text-xs text-white/40">
        Kaydettiğiniz filmler{" "}
        <Link href="/izleme-gunlugum/filmler" className="underline hover:text-white/70">
          İzleme günlüğüm → Filmler
        </Link>{" "}
        sayfasında DVD rafında görünür.
      </p>
    </div>
  );
}
