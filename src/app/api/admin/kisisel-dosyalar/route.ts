import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import {
  ensureKlasor,
  listKisiselDosyalar,
  listKlasorler,
  uploadKisiselDosya,
} from "@/lib/kisisel/dosyalar";

export async function GET(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const klasor = req.nextUrl.searchParams.get("klasor") || undefined;
  const folders = req.nextUrl.searchParams.get("folders") === "1";
  if (folders) {
    const items = await listKlasorler();
    return NextResponse.json(items);
  }
  const items = await listKisiselDosyalar(klasor);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      if (body?.action === "create-folder") {
        const result = await ensureKlasor(
          typeof body.klasor === "string" ? body.klasor : ""
        );
        if ("error" in result) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json(result);
      }
      return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const klasor = (form.get("klasor") as string) || "genel";
    if (!file) {
      return NextResponse.json({ error: "Dosya gerekli." }, { status: 400 });
    }
    const result = await uploadKisiselDosya(file, klasor);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
