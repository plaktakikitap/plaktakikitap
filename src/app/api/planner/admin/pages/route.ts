import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/admin-auth";

const MONTH_LABELS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export async function POST(request: NextRequest) {
  const ok = await verifyAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const year = Number(body.year ?? new Date().getFullYear());
    const month = Number(body.month ?? 1);

    if (month < 1 || month > 12) return NextResponse.json({ error: "Invalid month" }, { status: 400 });

    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from("planner_pages")
      .select("id")
      .eq("year", year)
      .eq("month", month)
      .maybeSingle();

    if (existing) return NextResponse.json(existing);

    const { data: created, error } = await supabase
      .from("planner_pages")
      .insert({ year, month, title: MONTH_LABELS[month - 1] })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(created);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
