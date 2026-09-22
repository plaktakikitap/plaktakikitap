import { Amiri } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DilSayfasi } from "@/components/admin/DilSayfasi";
import {
  getDilStats,
  listDilKelimeler,
  listDilNotlar,
} from "@/lib/takip/diller";
import {
  DIL_LISTESI,
  DIL_META,
  type DilKodu,
} from "@/types/dil";

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const dynamic = "force-dynamic";

export default async function AdminDilPage({
  params,
}: {
  params: Promise<{ dil: string }>;
}) {
  const { dil: dilParam } = await params;
  if (!DIL_LISTESI.includes(dilParam as DilKodu)) {
    notFound();
  }
  const dil = dilParam as DilKodu;
  const meta = DIL_META[dil];

  const [stats, kelimeler, notlar] = await Promise.all([
    getDilStats(dil),
    listDilKelimeler({ dil, limit: 40, offset: 0, sort: "yeni" }),
    listDilNotlar(dil),
  ]);

  return (
    <div className={`mx-auto max-w-3xl ${amiri.variable}`}>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1a1612]">
          {meta.bayrak} {meta.label}
        </h1>
        <p className="mt-1 text-sm text-[#6b6158]">
          Kelime bankası · flashcard · notlar
        </p>
      </header>

      <nav className="mb-8 flex flex-wrap gap-2">
        {DIL_LISTESI.map((d) => {
          const m = DIL_META[d];
          const active = d === dil;
          return (
            <Link
              key={d}
              href={`/secretgate/diller/${d}`}
              className={`rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? "bg-amber-500 text-black"
                  : "bg-[#1a1612]/5 text-[#6b6158] hover:bg-[#1a1612]/8"
              }`}
            >
              {m.bayrak} {m.label}
            </Link>
          );
        })}
      </nav>

      <DilSayfasi
        dil={dil}
        bayrak={meta.bayrak}
        arapcaMod={meta.arapcaMod}
        amiriClassName={amiri.className}
        initialStats={stats}
        initialKelimeler={kelimeler.items}
        initialTotal={kelimeler.total}
        initialNotlar={notlar}
      />
    </div>
  );
}
