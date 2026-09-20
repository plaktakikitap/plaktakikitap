import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SiteSettingsValue } from "@/lib/site-settings";
import { getSiteSettings } from "@/lib/site-settings";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const settings = await getSiteSettings();
    const { admin_password_hash: _hash, ...safe } = settings;
    return NextResponse.json(safe);
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
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = (await req.json()) as Partial<SiteSettingsValue>;
    const { admin_password_hash: _ignore, ...safeBody } = body as SiteSettingsValue &
      Record<string, unknown>;
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("site_settings")
      .select("id, value")
      .limit(1)
      .order("updated_at", { ascending: false })
      .maybeSingle();

    const current = (existing?.value as Record<string, unknown> | null) ?? {};
    const next = { ...current, ...safeBody };
    // Preserve existing hash; never overwrite via generic PATCH
    if (current.admin_password_hash != null) {
      next.admin_password_hash = current.admin_password_hash;
    } else {
      delete next.admin_password_hash;
    }

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

    revalidateTag("site-settings", "max");
    revalidatePath("/", "layout");
    revalidatePath("/secretgate/settings");
    revalidatePath("/home");

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Kaydetme hatası" },
      { status: 500 }
    );
  }
}
