import { NextRequest, NextResponse } from "next/server";
import { fetchCanvasItems, type PlannerCanvasItemKind } from "@/lib/planner";
import { createAdminClient } from "@/lib/supabase/admin";

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
    const items = await fetchCanvasItems(year, month);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

type CanvasItemPayload = {
  page: "left" | "right";
  item_kind: PlannerCanvasItemKind;
  item_key: string;
  x: number;
  y: number;
  rotation: number;
  z_index: number;
};

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, items } = body as {
      year: number;
      month: number;
      items: CanvasItemPayload[];
    };
    const y = Number(year);
    const m = Number(month);
    if (Number.isNaN(y) || Number.isNaN(m) || m < 1 || m > 12) {
      return NextResponse.json(
        { error: "year and month (1–12) required" },
        { status: 400 }
      );
    }
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "items array required" },
        { status: 400 }
      );
    }
    const supabase = createAdminClient();
    for (const it of items) {
      const x = Math.max(0, Math.min(1, Number(it.x)));
      const yVal = Math.max(0, Math.min(1, Number(it.y)));
      const { error } = await supabase.from("planner_canvas_item").upsert(
        {
          year: y,
          month: m,
          page: it.page,
          item_kind: it.item_kind,
          item_key: String(it.item_key),
          x,
          y: yVal,
          rotation: Number(it.rotation) || 0,
          z_index: Number(it.z_index) || 0,
        },
        { onConflict: "year,month,page,item_kind,item_key" }
      );
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
