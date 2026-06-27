import { NextRequest, NextResponse } from "next/server";
import { setCvDownloadSetting, uploadCvPdf } from "@/lib/works";

const MAX_SIZE = 15 * 1024 * 1024;

function isPdfFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === "application/pdf" ||
    file.type === "application/x-pdf" ||
    name.endsWith(".pdf")
  );
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file?.size) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Dosya çok büyük (max 15MB)" }, { status: 400 });
    }
    if (!isPdfFile(file)) {
      return NextResponse.json({ error: "Lütfen PDF dosyası seçin." }, { status: 400 });
    }

    const uploaded = await uploadCvPdf(file);
    if ("error" in uploaded) {
      return NextResponse.json({ error: uploaded.error }, { status: 500 });
    }

    const saved = await setCvDownloadSetting(uploaded.path);
    if ("error" in saved) {
      return NextResponse.json({ error: saved.error }, { status: 500 });
    }

    return NextResponse.json({
      path: uploaded.path,
      downloadUrl: "/api/cv/download",
    });
  } catch {
    return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 });
  }
}
