import { NextRequest, NextResponse } from "next/server";
import { uploadWorksMedia } from "@/lib/works";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const path = formData.get("path") as string | null;
    if (!file || !path?.trim()) {
      return NextResponse.json({ error: "file and path required" }, { status: 400 });
    }
    const result = await uploadWorksMedia(file, path.trim());
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ path: result.path });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
