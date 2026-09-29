import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Dil } from "@/types/dil-ogrenme";

export async function getDilOgrenmeOzet(dil: Dil): Promise<{
  hazine: number;
  xp: number;
}> {
  try {
    const sb = createAdminClient();
    const [{ count: hazine }, { data: xpRows }] = await Promise.all([
      sb
        .from("dil_kelime_hazinesi")
        .select("id", { count: "exact", head: true })
        .eq("dil", dil),
      sb.from("dil_xp_kayitlari").select("xp").eq("dil", dil),
    ]);
    const xp = (xpRows ?? []).reduce((s, r) => s + (Number(r.xp) || 0), 0);
    return { hazine: hazine ?? 0, xp };
  } catch {
    return { hazine: 0, xp: 0 };
  }
}
