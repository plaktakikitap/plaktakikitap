import { NextRequest, NextResponse } from "next/server";
import { upsertDayEntry } from "@/lib/planner";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const date = body.date as string | undefined;
    if (!date?.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return NextResponse.json({ error: "Valid date (YYYY-MM-DD) required" }, { status: 400 });
    }
    const result = await upsertDayEntry({
      date,
      title: body.title,
      content: body.content,
      photos: body.photos,
      tags: body.tags,
    });
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
