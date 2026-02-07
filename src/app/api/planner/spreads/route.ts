import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSpreadAdmin } from "@/lib/planner-admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") ?? "", 10);
  const month = parseInt(searchParams.get("month") ?? "", 10);
  if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json(
      { error: "year and month (1–12) required" },
      { status: 400 }
    );
  }
  try {
    const result = await getOrCreateSpreadAdmin(year, month);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
