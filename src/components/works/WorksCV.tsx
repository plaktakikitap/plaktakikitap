import Link from "next/link";
import { Download } from "lucide-react";

type Experience = {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  order_index: number;
};

export function WorksCV({
  experiences,
  cvDownloadUrl,
}: {
  experiences: Experience[];
  cvDownloadUrl: string;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-6 font-editorial text-2xl font-medium text-white sm:text-3xl">
        Özgeçmiş
      </h2>

      {experiences.length > 0 && (
        <div className="relative mb-10">
          {/* Minimal çizgi */}
          <div
            className="absolute left-3 top-0 bottom-0 w-px sm:left-4"
            style={{
              background: "linear-gradient(180deg, transparent, rgba(212,175,55,0.3) 20%, rgba(212,175,55,0.3) 80%, transparent)",
            }}
          />
          <ul className="space-y-6">
            {experiences.map((e) => (
              <li key={e.id} className="relative flex gap-4 pl-10 sm:pl-12">
                <span
                  className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-amber-400/80"
                  aria-hidden
                />
                <div>
                  <p className="font-medium text-white">
                    {e.role} · {e.company}
                  </p>
                  <p className="text-sm text-amber-200/90">{e.period}</p>
                  {e.description && (
                    <p className="mt-1 text-sm leading-relaxed text-white/70">
                      {e.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {cvDownloadUrl && (
        <Link
          href={cvDownloadUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-400/15 px-5 py-3 font-medium text-amber-100 transition hover:bg-amber-400/25 hover:border-amber-400/70"
        >
          <Download className="h-5 w-5" />
          CV İndir
        </Link>
      )}
    </section>
  );
}
