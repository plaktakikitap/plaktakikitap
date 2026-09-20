import { NextRequest, NextResponse } from "next/server";
import {
  updatePlannerMediaAdmin,
  deletePlannerMediaAdmin,
} from "@/lib/planner-admin";
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

    const attachmentType = body.attachmentType;
    const attachmentStyle = body.attachmentStyle;
    const validType =
      attachmentType === undefined ||
      attachmentType === null ||
      attachmentType === "" ||
      attachmentType === "paperclip" ||
      attachmentType === "paste" ||
      attachmentType === "staple";
    const validStyle =
      attachmentStyle === undefined ||
      attachmentStyle === null ||
      attachmentStyle === "" ||
      attachmentStyle === "standard_clip" ||
      attachmentStyle === "colorful_clip" ||
      attachmentStyle === "binder_clip" ||
      attachmentStyle === "staple";

    if (!validType || !validStyle) {
      return NextResponse.json({ error: "Invalid attachment" }, { status: 400 });
    }

    const result = await updatePlannerMediaAdmin(id, {
      attachmentType:
        (attachmentType === "" ? null : attachmentType) ?? undefined,
      attachmentStyle:
        (attachmentStyle === "" ? null : attachmentStyle) ?? undefined,
    });
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi(request);
  if (denied) return denied;

  const { id } = await params;
  const result = await deletePlannerMediaAdmin(id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
