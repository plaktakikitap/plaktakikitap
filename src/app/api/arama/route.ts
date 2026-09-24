import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripSpoilers } from "@/lib/spoiler";

export type AramaTip =
  | "kitap"
  | "film"
  | "dizi"
  | "karalama"
  | "yazi"
  | "foto";

export type AramaSonuc = {
  id: string;
  tip: AramaTip;
  baslik: string;
  altyazi: string;
  url: string;
  gorsel: string | null;
};

function sanitizeQuery(q: string): string {
  return q.replace(/[%_,()]/g, " ").replace(/\s+/g, " ").trim();
}

function preview(text: string | null | undefined, max = 60): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trimEnd()}...`;
}

function photoPublicUrl(
  supabase: ReturnType<typeof createAdminClient>,
  pathOrUrl: string | null
): string | null {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  const { data } = supabase.storage.from("photos-media").getPublicUrl(pathOrUrl);
  return data.publicUrl || null;
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const q = sanitizeQuery(raw);

  if (q.length < 2) {
    return NextResponse.json({ sonuclar: [], toplam: 0 });
  }

  const pattern = `%${q}%`;
  const supabase = createAdminClient();

  const [kitaplar, filmler, diziler, karalamalar, yazilar, fotograflar] =
    await Promise.all([
      supabase
        .from("books")
        .select("id, title, author, cover_url")
        .in("visibility", ["public", "unlisted"])
        .neq("status", "to_read")
        .or(`title.ilike."${pattern}",author.ilike."${pattern}"`)
        .limit(5),

      supabase
        .from("content_items")
        .select("id, title, films(year, poster_url)")
        .eq("type", "film")
        .in("visibility", ["public", "unlisted"])
        .ilike("title", pattern)
        .limit(5),

      supabase
        .from("content_items")
        .select("id, title, series(year, poster_url)")
        .eq("type", "series")
        .in("visibility", ["public", "unlisted"])
        .ilike("title", pattern)
        .limit(5),

      supabase
        .from("karalamalar")
        .select("id, baslik, icerik, slug")
        .eq("yayinda", true)
        .or(`baslik.ilike."${pattern}",icerik.ilike."${pattern}"`)
        .limit(5),

      supabase
        .from("writings")
        .select("id, title")
        .ilike("title", pattern)
        .limit(3),

      supabase
        .from("photos")
        .select("id, caption, image_url")
        .not("caption", "is", null)
        .ilike("caption", pattern)
        .limit(3),
    ]);

  const sonuclar: AramaSonuc[] = [];

  for (const k of kitaplar.data ?? []) {
    sonuclar.push({
      id: k.id,
      tip: "kitap",
      baslik: k.title ?? "",
      altyazi: k.author ?? "",
      url: `/readings`,
      gorsel: k.cover_url ?? null,
    });
  }

  for (const f of filmler.data ?? []) {
    const rawFilm = f.films as
      | { year?: number | null; poster_url?: string | null }
      | { year?: number | null; poster_url?: string | null }[]
      | null;
    const film = Array.isArray(rawFilm) ? rawFilm[0] : rawFilm;
    sonuclar.push({
      id: f.id,
      tip: "film",
      baslik: f.title ?? "",
      altyazi: film?.year != null ? String(film.year) : "",
      url: `/izleme-gunlugum/filmler`,
      gorsel: film?.poster_url ?? null,
    });
  }

  for (const d of diziler.data ?? []) {
    const rawSeries = d.series as
      | { year?: number | null; poster_url?: string | null }
      | { year?: number | null; poster_url?: string | null }[]
      | null;
    const series = Array.isArray(rawSeries) ? rawSeries[0] : rawSeries;
    sonuclar.push({
      id: d.id,
      tip: "dizi",
      baslik: d.title ?? "",
      altyazi: series?.year != null ? String(series.year) : "",
      url: `/diziler`,
      gorsel: series?.poster_url ?? null,
    });
  }

  for (const k of karalamalar.data ?? []) {
    sonuclar.push({
      id: k.id,
      tip: "karalama",
      baslik: k.baslik ?? "",
      altyazi: preview(stripSpoilers(k.icerik)),
      url: `/karalamalar/${k.slug}`,
      gorsel: null,
    });
  }

  for (const y of yazilar.data ?? []) {
    sonuclar.push({
      id: y.id,
      tip: "yazi",
      baslik: y.title ?? "",
      altyazi: "",
      url: `/writings/${y.id}`,
      gorsel: null,
    });
  }

  for (const p of fotograflar.data ?? []) {
    sonuclar.push({
      id: p.id,
      tip: "foto",
      baslik: preview(p.caption, 80) || "Fotoğraf",
      altyazi: "",
      url: `/photos`,
      gorsel: photoPublicUrl(supabase, p.image_url),
    });
  }

  return NextResponse.json({ sonuclar, toplam: sonuclar.length });
}
