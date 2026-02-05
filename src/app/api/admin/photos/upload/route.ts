import { NextRequest, NextResponse } from "next/server";
import { uploadPhotoFile } from "@/lib/photos";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const path = formData.get("path") as string | null;
    if (!file) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }
    const result = await uploadPhotoFile(file, path?.trim() || undefined);
    if (!result) return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
