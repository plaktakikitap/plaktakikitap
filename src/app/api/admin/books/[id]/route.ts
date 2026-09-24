import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import { patchAdminBook } from "@/lib/queries";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const allowed = [
      "status",
      "visibility",
      "is_featured_current",
      "progress_percent",
      "review",
    ];
    const payload = Object.fromEntries(
      Object.entries(body as Record<string, unknown>).filter(([k]) => allowed.includes(k))
    );
    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
    }
    const result = await patchAdminBook(id, payload);
    if (!result) return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
