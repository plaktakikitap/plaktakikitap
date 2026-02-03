import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const PRESETS = ["fingerprint", "smudge_blob", "smudge_stain", "ink_bleed"] as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!date?.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("planner_day_smudge")
    .select("preset, x, y, rotation, opacity")
    .eq("date", date)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!date?.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const preset = PRESETS.includes(body.preset) ? body.preset : PRESETS[Math.floor(Math.random() * PRESETS.length)];
  const x = typeof body.x === "number" ? body.x : 0.2 + Math.random() * 0.6;
  const y = typeof body.y === "number" ? body.y : 0.3 + Math.random() * 0.5;
  const rotation = typeof body.rotation === "number" ? body.rotation : (Math.random() - 0.5) * 40;
  const opacity = typeof body.opacity === "number" ? Math.min(1, Math.max(0.05, body.opacity)) : 0.1 + Math.random() * 0.15;

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("planner_day_smudge")
    .upsert(
      { date, preset, x, y, rotation, opacity },
      { onConflict: "date" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!date?.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("planner_day_smudge").delete().eq("date", date);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
