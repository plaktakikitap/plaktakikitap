import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BookStatus } from "@/types/database";

/**
 * Durum `reading` ise önceki `is_featured_current` sıfırlanır;
 * çağıran kayıt `true` yazmalı. Diğer durumlarda `false` döner.
 */
export async function syncBookFeaturedCurrent(
  status: BookStatus,
  exceptId?: string
): Promise<boolean> {
  if (status !== "reading") return false;

  const supabase = createAdminClient();
  let q = supabase
    .from("books")
    .update({ is_featured_current: false })
    .eq("is_featured_current", true);
  if (exceptId) q = q.neq("id", exceptId);
  await q;
  return true;
}
