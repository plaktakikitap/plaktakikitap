import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/** Public: Timeline entries for Beni Tanıyın */
export async function GET() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("about_timeline")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
