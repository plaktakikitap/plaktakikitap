import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULTS = {
  show_coffee_stain: true,
  show_washi_tape: true,
  show_polaroid: true,
  show_curled_corner: true,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") ?? "2026", 10);
  const month = parseInt(searchParams.get("month") ?? "1", 10);

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("planner_page_settings")
      .select("*")
      .eq("year", year)
      .eq("month", month)
      .maybeSingle();

    if (error) return NextResponse.json(DEFAULTS);
    return NextResponse.json(data ?? DEFAULTS);
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year = 2026, month = 1, ...settings } = body;

    const supabase = createAdminClient();
    const { error } = await supabase.from("planner_page_settings").upsert(
      {
        year: Number(year),
        month: Number(month),
        show_coffee_stain: settings.show_coffee_stain ?? true,
        show_washi_tape: settings.show_washi_tape ?? true,
        show_polaroid: settings.show_polaroid ?? true,
        show_curled_corner: settings.show_curled_corner ?? true,
      },
      { onConflict: "year,month" }
    );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
