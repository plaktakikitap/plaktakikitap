import { NextRequest, NextResponse } from "next/server";
import { uploadPhotoFile } from "@/lib/photos";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

const MAX_SIZE = 10 * 1024 * 1024;
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
    const path = formData.get("path") as string | null;
    if (!file) {
      return NextResponse.json({ error: "Dosya gerekli." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Dosya 10MB'dan küçük olmalı" },
        { status: 400 }
      );
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Geçersiz dosya tipi" }, { status: 400 });
    }
    const result = await uploadPhotoFile(file, path?.trim() || undefined);
    if ("error" in result) {
      const status = result.error.includes("10MB") || result.error.includes("Sadece")
        ? 400
        : 500;
      return NextResponse.json({ error: result.error }, { status });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("Fotoğraf upload isteği hatası:", err);
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
