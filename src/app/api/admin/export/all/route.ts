import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import {
  fetchExportDiziler,
  fetchExportFilmler,
  fetchExportKitaplar,
} from "@/lib/export-data";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;
  try {
    const [kitaplar, filmler, diziler] = await Promise.all([
      fetchExportKitaplar(),
      fetchExportFilmler(),
      fetchExportDiziler(),
    ]);
    return NextResponse.json({ kitaplar, filmler, diziler });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Export hatası" },
      { status: 500 }
    );
  }
}
