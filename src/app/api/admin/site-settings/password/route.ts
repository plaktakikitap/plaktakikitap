import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const SALT_ROUNDS = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newPassword = typeof body.new_password === "string" ? body.new_password.trim() : "";
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });
    }

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("site_settings")
      .select("id, value")
      .limit(1)
      .order("updated_at", { ascending: false })
      .maybeSingle();

    const current = (existing?.value as Record<string, unknown> | null) ?? {};
    const next = { ...current, admin_password_hash: hash };

    if (existing?.id) {
      const { error } = await supabase
        .from("site_settings")
        .update({ value: next, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      await supabase.from("site_settings").insert({ value: next });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Şifre güncellenemedi" },
      { status: 500 }
    );
  }
}
