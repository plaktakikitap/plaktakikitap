import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCvStoragePath } from "@/lib/works";

const BUCKET = "works-media";
const SIGNED_EXPIRES = 60 * 60;

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: settings } = await supabase
      .from("works_settings")
      .select("value")
      .eq("key", "cv_download_url")
      .maybeSingle();

    const stored = (settings?.value as string)?.trim() ?? "";
    if (!stored) {
      return NextResponse.json({ error: "CV bulunamadı" }, { status: 404 });
    }

    if (!isCvStoragePath(stored)) {
      return NextResponse.redirect(stored);
    }

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(stored, SIGNED_EXPIRES);

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: "CV indirilemedi" }, { status: 404 });
    }

    return NextResponse.redirect(data.signedUrl);
  } catch {
    return NextResponse.json({ error: "CV indirilemedi" }, { status: 500 });
  }
}
