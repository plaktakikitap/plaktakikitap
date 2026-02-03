import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { addPlannerMedia } from "@/lib/planner";

const BUCKET = "planner-media";
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const entryId = (formData.get("entryId") as string)?.trim();
    const attachmentTypeRaw = (formData.get("attachmentType") as string)?.trim();
    const attachmentStyleRaw = (formData.get("attachmentStyle") as string)?.trim();
    const attachmentType =
      attachmentTypeRaw === "paperclip" || attachmentTypeRaw === "paste" || attachmentTypeRaw === "staple" ? attachmentTypeRaw : undefined;
    const attachmentStyle =
      attachmentStyleRaw === "standard_clip" || attachmentStyleRaw === "colorful_clip" || attachmentStyleRaw === "binder_clip" || attachmentStyleRaw === "staple"
        ? attachmentStyleRaw
        : undefined;

    if (!file?.size) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const supabase = await createServerClient();

    const ext = file.name.split(".").pop() || "bin";
    const path = `${entryId || "temp"}/${crypto.randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (entryId) {
      const type = file.type.startsWith("video/") ? "video" : "image";
      const result = await addPlannerMedia({
        entryId,
        type,
        url: data.path,
        attachmentType,
        attachmentStyle,
      });
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json({ path: data.path, mediaId: result.id });
    }

    return NextResponse.json({ path: data.path });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
