import Link from "next/link";
import { BookOpen, Brain, GraduationCap } from "lucide-react";
import { DIL_LISTESI, DIL_META } from "@/types/dil";
import { DILLER, isDil } from "@/types/dil-ogrenme";

export const dynamic = "force-dynamic";

const DL_ADI_TR: Record<string, string> = {
  ingilizce: "🇬🇧 İngilizce",
  fransizca: "🇫🇷 Fransızca",
  almanca: "🇩🇪 Almanca",
};

export default function AdminDillerIndexPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 grid grid-cols-3 gap-3">
        {DILLER.map((dil) => (
          <Link
            key={dil}
            href={`/secretgate/diller/${dil}/ogrenme`}
            className="group flex flex-col items-center gap-2 rounded-xl border border-[#e8e0d4] bg-white/60 p-4 transition-all hover:border-[#b8934a]/40 hover:bg-white/80"
          >
            <span className="text-2xl">{DL_ADI_TR[dil].split(" ")[0]}</span>
            <span className="text-xs font-medium capitalize text-[#1a1612]">
              {dil}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-[#b8934a] group-hover:text-[#a07840]">
              <Brain size={12} />
              Öğren
            </span>
          </Link>
        ))}
      </div>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1a1612]">Diller</h1>
        <p className="mt-1 text-sm text-[#6b6158]">
          Kelime bankası ayrı; quiz, yazı ödevi ve XP öğrenme sayfasında.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {DIL_LISTESI.map((dil) => {
          const meta = DIL_META[dil];
          const ogrenme = isDil(dil);
          return (
            <div
              key={dil}
              className="rounded-2xl border border-[#e8e0d4] bg-white/70 p-4"
            >
              <p className="text-lg font-semibold text-[#1a1612]">
                {meta.bayrak} {meta.label}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/secretgate/diller/${dil}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8e0d4] bg-[#faf7f2] px-3 py-2 text-xs font-medium text-[#6b6158] transition hover:border-[#b8934a]/40 hover:text-[#1a1612]"
                >
                  <BookOpen size={14} className="text-[#b8934a]" />
                  Kelime bankası
                </Link>
                {ogrenme ? (
                  <Link
                    href={`/secretgate/diller/${dil}/ogrenme`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8e0d4] bg-[#faf7f2] px-3 py-2 text-xs font-medium text-[#6b6158] transition hover:border-[#b8934a]/40 hover:text-[#1a1612]"
                  >
                    <GraduationCap size={14} className="text-[#b8934a]" />
                    Öğrenme
                  </Link>
                ) : (
                  <span className="inline-flex items-center rounded-xl px-3 py-2 text-xs text-[#6b6158]/70">
                    Öğrenme yok
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
