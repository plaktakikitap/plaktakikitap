import { NextRequest, NextResponse } from "next/server";
import { getDayEntry } from "@/lib/planner";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!date?.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return NextResponse.json({ error: "Valid date (YYYY-MM-DD) required" }, { status: 400 });
  }
  try {
    const entry = await getDayEntry(date);
    return NextResponse.json(entry ?? null);
  } catch {
    return NextResponse.json(null, { status: 200 });
  }
}
