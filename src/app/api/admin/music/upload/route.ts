import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

const BUCKET = "music";
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
  "audio/m4a",
  "audio/mp3",
];
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string)?.trim() || "audio"; // "audio" | "cover"

    if (!file?.size) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Dosya 10MB'dan küçük olmalı" },
        { status: 400 }
      );
    }

    const isAudio = type === "audio";
    const allowed = isAudio ? ALLOWED_AUDIO_TYPES : ALLOWED_IMAGE_TYPES;
    const okType =
      allowed.includes(file.type) ||
      (isAudio && file.name.toLowerCase().endsWith(".mp3"));

    if (!okType) {
      return NextResponse.json(
        { error: "Geçersiz dosya tipi" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const ext =
      file.name.split(".").pop()?.toLowerCase() || (isAudio ? "mp3" : "jpg");
    const folder = isAudio ? "audio" : "covers";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return NextResponse.json({ url: urlData.publicUrl, path: data.path });
  } catch {
    return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 });
  }
}
