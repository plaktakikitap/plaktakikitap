import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { KisiselDosya } from "@/types/kisisel";

export type { KisiselDosya } from "@/types/kisisel";

export const KISISEL_BUCKET = "kisisel-dosyalar";
export const DEFAULT_FOLDERS = ["genel", "is", "kisisel", "belgeler"] as const;
const MAX_BYTES = 50 * 1024 * 1024;

const SELECT =
  "id, dosya_adi, depolama_yolu, dosya_turu, boyut, klasor, olusturma_tarihi";

function mapRow(r: Record<string, unknown>): KisiselDosya {
  return {
    id: r.id as string,
    dosya_adi: r.dosya_adi as string,
    depolama_yolu: r.depolama_yolu as string,
    dosya_turu: (r.dosya_turu as string | null) ?? null,
    boyut: typeof r.boyut === "number" ? r.boyut : null,
    klasor: (r.klasor as string) || "genel",
    olusturma_tarihi: r.olusturma_tarihi as string,
  };
}

function guessType(fileName: string, mime: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
    return "image";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (
    mime.includes("document") ||
    mime.includes("word") ||
    ["doc", "docx", "odt", "txt", "md"].includes(ext)
  )
    return "document";
  if (mime.startsWith("video/") || ["mp4", "mov", "webm"].includes(ext)) return "video";
  if (mime.startsWith("audio/") || ["mp3", "wav", "m4a"].includes(ext)) return "audio";
  return ext || "file";
}

export async function listKisiselDosyalar(
  klasor?: string
): Promise<KisiselDosya[]> {
  try {
    const supabase = createAdminClient();
    let q = supabase
      .from("kisisel_dosyalar")
      .select(SELECT)
      .order("olusturma_tarihi", { ascending: false });
    if (klasor) q = q.eq("klasor", klasor);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function listKlasorler(): Promise<string[]> {
  const files = await listKisiselDosyalar();
  const set = new Set<string>([...DEFAULT_FOLDERS]);
  for (const f of files) {
    if (f.klasor?.trim()) set.add(f.klasor.trim());
  }
  return [...set].sort((a, b) => {
    const ai = (DEFAULT_FOLDERS as readonly string[]).indexOf(a);
    const bi = (DEFAULT_FOLDERS as readonly string[]).indexOf(b);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.localeCompare(b, "tr");
  });
}

export async function uploadKisiselDosya(
  file: File,
  klasor: string
): Promise<KisiselDosya | { error: string }> {
  if (!file?.size) return { error: "Dosya gerekli." };
  if (file.size > MAX_BYTES) return { error: "Dosya 50MB'tan küçük olmalı." };

  const folder =
    (klasor || "genel")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_\-ğüşıöç]/gi, "-") || "genel";
  const safeName = file.name
    .replace(/[^\w.\-ğüşıöçĞÜŞİÖÇ ]+/gi, "_")
    .slice(0, 120);
  const path = `${folder}/${Date.now()}-${safeName}`;

  const supabase = createAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage
    .from(KISISEL_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (upErr) return { error: upErr.message };

  const { data, error } = await supabase
    .from("kisisel_dosyalar")
    .insert({
      dosya_adi: file.name,
      depolama_yolu: path,
      dosya_turu: guessType(file.name, file.type || ""),
      boyut: file.size,
      klasor: folder,
    })
    .select(SELECT)
    .single();

  if (error) {
    await supabase.storage.from(KISISEL_BUCKET).remove([path]);
    return { error: error.message };
  }
  return mapRow(data as Record<string, unknown>);
}

export async function createSignedDownloadUrl(
  depolama_yolu: string,
  expiresIn = 60
): Promise<{ url: string } | { error: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(KISISEL_BUCKET)
    .createSignedUrl(depolama_yolu, expiresIn);
  if (error || !data?.signedUrl) {
    return { error: error?.message || "İmza URL oluşturulamadı." };
  }
  return { url: data.signedUrl };
}

export async function deleteKisiselDosya(
  id: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { data: row, error: fetchErr } = await supabase
    .from("kisisel_dosyalar")
    .select("depolama_yolu")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr) return { error: fetchErr.message };
  if (!row) return { error: "Dosya bulunamadı." };

  const path = row.depolama_yolu as string;
  await supabase.storage.from(KISISEL_BUCKET).remove([path]);
  const { error } = await supabase.from("kisisel_dosyalar").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function ensureKlasor(
  klasor: string
): Promise<{ klasor: string } | { error: string }> {
  const name = klasor
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-ğüşıöç]/gi, "-");
  if (!name) return { error: "Klasör adı gerekli." };
  if (name.length > 40) return { error: "Klasör adı çok uzun." };

  const existing = await listKlasorler();
  if (existing.includes(name)) return { klasor: name };

  const supabase = createAdminClient();
  const path = `${name}/.keep`;
  const { error: upErr } = await supabase.storage
    .from(KISISEL_BUCKET)
    .upload(path, new Uint8Array([0]), {
      contentType: "application/octet-stream",
      upsert: true,
    });
  if (upErr) return { error: upErr.message };

  const { error } = await supabase.from("kisisel_dosyalar").insert({
    dosya_adi: ".keep",
    depolama_yolu: path,
    dosya_turu: "folder",
    boyut: 0,
    klasor: name,
  });
  if (error) return { error: error.message };
  return { klasor: name };
}
