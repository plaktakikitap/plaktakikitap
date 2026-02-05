import { NextRequest, NextResponse } from "next/server";
import { getSpreadElements, upsertSpreadElements, type PlannerElementType } from "@/lib/planner";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: spreadId } = await params;
  if (!spreadId) {
    return NextResponse.json({ error: "spread id required" }, { status: 400 });
  }
  try {
    const elements = await getSpreadElements(spreadId);
    return NextResponse.json(elements);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

type ElementPayload = {
  id?: string | null;
  page_side: "left" | "right";
  type: PlannerElementType;
  src?: string | null;
  text?: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  z_index: number;
  meta?: Record<string, unknown> | null;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: spreadId } = await params;
  if (!spreadId) {
    return NextResponse.json({ error: "spread id required" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const elements = body.elements as ElementPayload[] | undefined;
    if (!Array.isArray(elements)) {
      return NextResponse.json({ error: "elements array required" }, { status: 400 });
    }
    const err = await upsertSpreadElements(spreadId, elements);
    if (err.error) {
      return NextResponse.json({ error: err.error }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
