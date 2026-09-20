import { NextResponse } from "next/server";
import { getRecentPlannerEntriesAdmin } from "@/lib/planner-admin";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const items = await getRecentPlannerEntriesAdmin(5);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
