import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

const BUCKET = "admin-uploads";
const PDF_BUCKET = "works-media";
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function isPdfFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === "application/pdf" ||
    file.type === "application/x-pdf" ||
    name.endsWith(".pdf")
  );
}

function resolveContentType(file: File): string {
  if (isPdfFile(file)) return "application/pdf";
  return file.type;
}

function isAllowedFile(file: File): boolean {
  if (isPdfFile(file)) return true;
  return ALLOWED_IMAGE_TYPES.includes(file.type);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string)?.trim() || "works";

    if (!file?.size) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Dosya 10MB'dan küçük olmalı" }, { status: 400 });
    }

    if (!isAllowedFile(file)) {
      return NextResponse.json(
        { error: "Geçersiz dosya tipi" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || (isPdfFile(file) ? "pdf" : "jpg");
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const contentType = resolveContentType(file);
    const bucket = isPdfFile(file) ? PDF_BUCKET : BUCKET;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false, contentType });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (isPdfFile(file)) {
      const { data: signed } = await supabase.storage
        .from(PDF_BUCKET)
        .createSignedUrl(data.path, 60 * 60 * 24 * 7);
      return NextResponse.json({
        url: signed?.signedUrl ?? "",
        path: data.path,
      });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return NextResponse.json({ url: urlData.publicUrl, path: data.path });
  } catch {
    return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 });
  }
}
