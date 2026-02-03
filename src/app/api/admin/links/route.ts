import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const text = String(form.get("links_json") ?? "[]");

  let arr: unknown[] = [];
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error("not array");
    arr = parsed;
  } catch {
    return NextResponse.redirect(new URL("/admin?err=links_json", req.url));
  }

  const supabase = createAdminClient();

  // Delete all existing links (match all UUIDs via neq to nil)
  await supabase
    .from("site_links")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const cleaned = arr.map((x, i) => {
    const o = (typeof x === "object" && x !== null ? x : {}) as Record<string, unknown>;
    return {
    type: String(o.type ?? "website"),
    label: String(o.label ?? o.type ?? "link"),
    url: String(o.url ?? "#"),
    sort_order: Number(o.sort_order ?? i),
    is_active: Boolean(o.is_active ?? true),
  };
  });

  await supabase.from("site_links").insert(cleaned);

  return NextResponse.redirect(new URL("/admin", req.url));
}
