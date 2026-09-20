import Link from "next/link";
import {
  SECTION_NAME,
  SECTION_PATH,
} from "@/lib/karalamalar-section";
import type { Karalama } from "@/lib/karalamalar";

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
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trimEnd()}...`;
}

/** Ana sayfa: kutucuksuz, son 3 karalama — ekşi/tweet tarzı. */
export function KaralamalarHomeSection({ items }: { items: Karalama[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[720px] px-4 sm:px-6">
      <p className="section-eyebrow mb-8">{SECTION_NAME}</p>

      {items.map((item, idx) => (
        <div key={item.id}>
          <article className="mb-10">
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
          {idx < items.length - 1 ? (
            <hr className="section-divider mb-10" />
          ) : null}
        </div>
      ))}

      <p className="mt-2">
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
