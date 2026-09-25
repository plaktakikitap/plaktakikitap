import Link from "next/link";
import {
  SECTION_NAME,
  SECTION_PATH,
} from "@/lib/karalamalar-section";
import type { Karalama } from "@/lib/karalamalar";
import { hasSpoilerMarkup, stripSpoilers } from "@/lib/spoiler";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function preview(text: string, max = 120): string {
  const clean = stripSpoilers(text);
  if (!clean) return hasSpoilerMarkup(text) ? "Spoiler içerir" : "";
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trimEnd()}...`;
}

/** Ana sayfa: son 5 karalama, hafif çerçeveli. */
export function KaralamalarHomeSection({ items }: { items: Karalama[] }) {
  const shown = items.slice(0, 5);
  if (shown.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[720px] px-4 sm:px-6">
      <p className="section-eyebrow mb-8">{SECTION_NAME}</p>

      <div className="space-y-3">
        {shown.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-[#1a1612]/[0.08] bg-white/[0.28] px-5 py-4 sm:px-6 sm:py-5"
          >
            <h3 className="type-3 m-0 mb-2 font-editorial font-medium tracking-[-0.01em] text-ink">
              <Link
                href={`${SECTION_PATH}/${item.slug}`}
                className="text-inherit no-underline"
              >
                {item.baslik}
              </Link>
            </h3>
            <p className="m-0 max-w-[680px] text-[1rem] leading-[1.7] text-ink-muted">
              {preview(item.icerik, 120)}
            </p>
            <time
              dateTime={item.olusturma_tarihi}
              className="type-4 mt-2 block tracking-[0.03em] text-ink-muted"
            >
              {formatDate(item.olusturma_tarihi)}
            </time>
          </article>
        ))}
      </div>

      <p className="mt-6">
        <Link
          href={SECTION_PATH}
          className="type-4 tracking-[0.06em] text-ink-muted no-underline transition hover:text-gold"
        >
          tümü →
        </Link>
      </p>
    </section>
  );
}
