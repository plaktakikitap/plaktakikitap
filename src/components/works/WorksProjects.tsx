import Link from "next/link";
import { ExternalLink } from "lucide-react";

type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  link_url: string;
  order_index: number;
};

export function WorksProjects({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="mb-6 font-editorial text-2xl font-medium text-ink sm:text-3xl">
        Deneyim & Projeler
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex flex-col rounded-2xl border border-ink/10 bg-ink/5 p-6 backdrop-blur-sm transition-all hover:border-gold/40 hover:bg-ink/5 hover:shadow-[0_0_32px_rgba(212,175,55,0.08)]"
          >
            <h3 className="font-editorial text-xl font-semibold text-ink">{p.title}</h3>
            {p.summary && (
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/75">{p.summary}</p>
            )}
            {p.link_url && (
              <Link
                href={p.link_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-sm font-medium text-gold transition hover:bg-gold-soft"
              >
                İncele
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
