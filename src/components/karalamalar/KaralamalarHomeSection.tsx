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
    <section className="mx-auto mt-10 w-full max-w-[720px] px-4 sm:mt-14 sm:px-6">
      <p className="mb-8 text-[0.7rem] font-medium lowercase tracking-[0.15em] text-[#9a9488]">
        {SECTION_NAME}
      </p>

      {items.map((item, idx) => (
        <div key={item.id}>
          <article className="mb-10">
            <h3
              className="m-0 mb-2 text-[1.05rem] font-semibold tracking-[-0.01em] text-[#f3ead9]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              <Link
                href={`${SECTION_PATH}/${item.slug}`}
                className="text-inherit no-underline"
              >
                {item.baslik}
              </Link>
            </h3>
            <p className="m-0 max-w-[680px] text-[0.9rem] leading-[1.7] text-[#c8bfb0]">
              {preview(item.icerik, 120)}
            </p>
            <time
              dateTime={item.olusturma_tarihi}
              className="mt-2 block text-[0.75rem] tracking-[0.03em] text-[#6b6560]"
            >
              {formatDate(item.olusturma_tarihi)}
            </time>
          </article>
          {idx < items.length - 1 ? (
            <hr className="mb-10 border-0 border-t border-[rgba(201,166,90,0.1)]" />
          ) : null}
        </div>
      ))}

      <p className="mt-2">
        <Link
          href={SECTION_PATH}
          className="text-[0.8rem] tracking-[0.06em] text-[#9a9488] no-underline transition hover:text-[#c9a65a]"
        >
          tümü →
        </Link>
      </p>
    </section>
  );
}
