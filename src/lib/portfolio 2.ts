import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PortfolioItem } from "@/types/database";

export type { PortfolioItem } from "@/types/database";

/** Public: portfolio_items, newest first. */
export async function getPortfolioPublic(): Promise<PortfolioItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("id, title, client, category, image_url, created_at")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as PortfolioItem[];
}
