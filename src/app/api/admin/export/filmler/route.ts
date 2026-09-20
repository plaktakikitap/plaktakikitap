import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import { fetchExportFilmler } from "@/lib/export-data";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;
  try {
    const data = await fetchExportFilmler();
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Export hatası" },
      { status: 500 }
    );
  }
}
