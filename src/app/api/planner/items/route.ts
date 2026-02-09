import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pageId = searchParams.get("page_id");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  try {
    const supabase = createAdminClient();

    if (pageId) {
      const { data, error } = await supabase
        .from("planner_items")
        .select("*")
        .eq("page_id", pageId)
        .order("z_index", { ascending: true });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data ?? []);
    }

    if (year && month) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10);
      if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
        return NextResponse.json({ error: "Invalid year/month" }, { status: 400 });
      }

      const { data: page } = await supabase
        .from("planner_pages")
        .select("id")
        .eq("year", y)
        .eq("month", m)
        .maybeSingle();

      if (!page?.id) return NextResponse.json([]);

      const { data, error } = await supabase
        .from("planner_items")
        .select("*")
        .eq("page_id", page.id)
        .order("z_index", { ascending: true });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data ?? []);
    }

    return NextResponse.json({ error: "page_id or year+month required" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
