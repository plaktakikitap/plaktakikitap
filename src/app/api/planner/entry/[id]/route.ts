import { NextRequest, NextResponse } from "next/server";
import { updatePlannerEntryAdmin } from "@/lib/planner-admin";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi(request);
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await request.json();

    const updates: Parameters<typeof updatePlannerEntryAdmin>[1] = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.content !== undefined) updates.content = body.content;
    if (body.tags !== undefined) updates.tags = body.tags;
    if (body.mood !== undefined) updates.mood = body.mood;
    if (body.summaryQuote !== undefined) updates.summaryQuote = body.summaryQuote;
    if (body.stickerSelection !== undefined)
      updates.stickerSelection = body.stickerSelection;

    const result = await updatePlannerEntryAdmin(id, updates);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
