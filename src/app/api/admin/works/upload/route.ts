import { NextRequest, NextResponse } from "next/server";
import { uploadWorksMedia } from "@/lib/works";
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
    if (!file || !path?.trim()) {
      return NextResponse.json({ error: "file and path required" }, { status: 400 });
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
    const result = await uploadWorksMedia(file, path.trim());
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ path: result.path });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
