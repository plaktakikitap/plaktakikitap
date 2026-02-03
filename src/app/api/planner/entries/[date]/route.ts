import { NextRequest, NextResponse } from "next/server";
import { fetchPlannerDayDetail } from "@/lib/planner";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!date) {
    return NextResponse.json({ error: "Date required" }, { status: 400 });
  }

  const entries = await fetchPlannerDayDetail(date);
  return NextResponse.json(entries);
}
