import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "music";
const MAX_AUDIO = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE = 5 * 1024 * 1024; // 5MB
const ALLOWED_AUDIO = ["audio/mpeg", "audio/mp3"];
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string)?.trim() || "audio"; // "audio" | "cover"

    if (!file?.size) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
    }

    const isAudio = type === "audio";
    const allowed = isAudio ? ALLOWED_AUDIO : ALLOWED_IMAGE;
    const maxSize = isAudio ? MAX_AUDIO : MAX_IMAGE;

    if (!allowed.includes(file.type) && !(isAudio && file.name.toLowerCase().endsWith(".mp3"))) {
      return NextResponse.json(
        { error: isAudio ? "Sadece MP3 kabul edilir" : "Sadece JPEG, PNG, WebP" },
        { status: 400 }
      );
    }
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: isAudio ? "Max 50MB" : "Max 5MB" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || (isAudio ? "mp3" : "jpg");
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
