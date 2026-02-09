import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/admin-auth";

const BUCKET = "planner-assets";
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const ok = await verifyAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file?.size) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large" }, { status: 400 });
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

    const supabase = createAdminClient();
    const ext = file.name.split(".").pop() || "bin";
    const path = `assets/${crypto.randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") || "";
    const publicUrl = base ? `${base}/storage/v1/object/public/${BUCKET}/${data.path}` : "";

    return NextResponse.json({ path: data.path, publicUrl });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
