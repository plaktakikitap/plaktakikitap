import { NextRequest, NextResponse } from "next/server";
import { fetchDecor } from "@/lib/planner";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") ?? "2026", 10);
  const month = parseInt(searchParams.get("month") ?? "0", 10);

  if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
    return NextResponse.json({ error: "Invalid year or month" }, { status: 400 });
  }

  const decors = await fetchDecor(year, month);
  return NextResponse.json(decors);
}
