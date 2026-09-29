import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import { DIL_META, DIL_LISTESI, type DilKodu } from "@/types/dil";
import type { AdminAramaSonuc } from "@/types/admin-arama";

export const dynamic = "force-dynamic";

const YAZI_KATEGORI: Record<string, string> = {
  denemeler: "Deneme",
  siirler: "Şiir",
  diger: "Diğer",
};

function sanitizeQuery(q: string): string {
  return q.replace(/[%_,()"\\]/g, " ").replace(/\s+/g, " ").trim();
}

function preview(text: string | null | undefined, max = 60): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return undefined;
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trimEnd()}...`;
}

function ilikeOr(columns: string[], pattern: string): string {
  return columns.map((col) => `${col}.ilike."${pattern}"`).join(",");
}

function formatTarih(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}.${m[2]}.${m[1]}`;
  try {
    return new Date(iso).toLocaleDateString("tr");
  } catch {
    return undefined;
  }
}

export async function GET(req: NextRequest) {
  const denied = await requireAdminApi(req);
  if (denied) return denied;

  const q = sanitizeQuery(req.nextUrl.searchParams.get("q") ?? "");
  if (q.length < 2) return NextResponse.json({ sonuclar: [] });

  const pattern = `%${q}%`;
  const sb = createAdminClient();

  const [
    yazilar,
    ceviriKitaplar,
    ceviriBagimsiz,
    ceviriGonullu,
    kitaplar,
    notlar,
    kelimeler,
  ] = await Promise.all([
    sb
      .from("writings")
      .select("id, title, body, category")
      .or(ilikeOr(["title", "body"], pattern))
      .limit(5),
    sb
      .from("translation_books")
      .select("id, title, original_author")
      .or(ilikeOr(["title", "original_author"], pattern))
      .limit(5),
    sb
      .from("translation_independent")
      .select("id, title, description")
      .or(ilikeOr(["title", "description"], pattern))
      .limit(5),
    sb
      .from("translation_volunteer_projects")
      .select("id, org_name, role_title, description")
      .or(ilikeOr(["org_name", "role_title", "description"], pattern))
      .limit(5),
    sb
      .from("books")
      .select("id, title, author")
      .or(ilikeOr(["title", "author"], pattern))
      .limit(5),
    sb.from("gunluk").select("id, icerik, tarih").ilike("icerik", pattern).limit(5),
    sb
      .from("dil_kelimeler")
      .select("id, dil, kelime, anlam, zorluk")
      .or(ilikeOr(["kelime", "anlam"], pattern))
      .limit(5),
  ]);

  const sonuclar: AdminAramaSonuc[] = [];

  for (const y of yazilar.data ?? []) {
    sonuclar.push({
      tur: "yazi",
      id: y.id,
      baslik: y.title || "Yazı",
      alt: YAZI_KATEGORI[y.category] ?? preview(y.body),
      href: "/secretgate/yazilarim",
    });
  }

  for (const c of ceviriKitaplar.data ?? []) {
    sonuclar.push({
      tur: "ceviri",
      id: c.id,
      baslik: c.title || "Çeviri",
      alt: c.original_author || "Yayın kitabı",
      href: `/secretgate/translations/books/${c.id}/edit`,
    });
  }

  for (const c of ceviriBagimsiz.data ?? []) {
    sonuclar.push({
      tur: "ceviri",
      id: c.id,
      baslik: c.title || "Bağımsız çeviri",
      alt: preview(c.description) ?? "Bağımsız",
      href: `/secretgate/translations/independent/${c.id}/edit`,
    });
  }

  for (const c of ceviriGonullu.data ?? []) {
    sonuclar.push({
      tur: "ceviri",
      id: c.id,
      baslik: c.org_name || "Gönüllü proje",
      alt: c.role_title || preview(c.description) || "Gönüllü",
      href: `/secretgate/translations/volunteer/${c.id}/edit`,
    });
  }

  for (const k of kitaplar.data ?? []) {
    sonuclar.push({
      tur: "kitap",
      id: k.id,
      baslik: k.title || "Kitap",
      alt: k.author || undefined,
      href: `/secretgate/reading-log/${k.id}/edit`,
    });
  }

  for (const n of notlar.data ?? []) {
    sonuclar.push({
      tur: "not",
      id: n.id,
      baslik: preview(n.icerik, 50) || "Günlük not",
      alt: formatTarih(n.tarih),
      href: "/secretgate/gunluk",
    });
  }

  for (const k of kelimeler.data ?? []) {
    const dil = DIL_LISTESI.includes(k.dil as DilKodu)
      ? (k.dil as DilKodu)
      : null;
    const dilLabel = dil ? DIL_META[dil].label : k.dil;
    sonuclar.push({
      tur: "kelime",
      id: k.id,
      baslik: `${k.kelime} — ${k.anlam}`,
      alt: [dilLabel, k.zorluk].filter(Boolean).join(" · "),
      href: dil ? `/secretgate/diller/${dil}` : "/secretgate/diller",
    });
  }

  return NextResponse.json({ sonuclar });
}
