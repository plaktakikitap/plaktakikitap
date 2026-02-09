import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULTS = {
  year: 2026,
  cover_title: "AJANDA",
  cover_subtitle: "2026",
  page_width: 550,
  page_height: 750,
};

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("planner_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) return NextResponse.json(DEFAULTS);
    if (!data) return NextResponse.json(DEFAULTS);

    return NextResponse.json({
      year: data.year ?? DEFAULTS.year,
      cover_title: data.cover_title ?? DEFAULTS.cover_title,
      cover_subtitle: data.cover_subtitle ?? DEFAULTS.cover_subtitle,
      page_width: data.page_width ?? DEFAULTS.page_width,
      page_height: data.page_height ?? DEFAULTS.page_height,
    });
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}
