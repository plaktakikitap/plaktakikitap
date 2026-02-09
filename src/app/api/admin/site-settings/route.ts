import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SiteSettingsValue } from "@/lib/site-settings";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (e) {
    const msg =
      e instanceof Error && e.message.includes("NEXT_PUBLIC_SUPABASE_URL")
        ? "Supabase ayarları eksik: .env.local içinde NEXT_PUBLIC_SUPABASE_URL (http veya https ile başlamalı) ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı. Dev sunucuyu yeniden başlatın."
        : e instanceof Error
          ? e.message
          : "Ayarlar yüklenemedi";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<SiteSettingsValue>;
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("site_settings")
      .select("id, value")
      .limit(1)
      .order("updated_at", { ascending: false })
      .maybeSingle();

    const current = (existing?.value as Record<string, unknown> | null) ?? {};
    const next = { ...current, ...body };

    if (existing?.id) {
      const { error } = await supabase
        .from("site_settings")
        .update({ value: next, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await supabase.from("site_settings").insert({ value: next });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    revalidatePath("/home");

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Kaydetme hatası" },
      { status: 500 }
    );
  }
}
