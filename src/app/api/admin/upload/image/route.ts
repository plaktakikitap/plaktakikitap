import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "admin-uploads";
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string)?.trim() || "images";

    if (!file?.size) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Dosya çok büyük (max 10MB)" }, { status: 400 });
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Desteklenen formatlar: JPEG, PNG, WebP, GIF" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
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
