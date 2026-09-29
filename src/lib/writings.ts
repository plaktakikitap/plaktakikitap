import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type WritingCategory = "denemeler" | "siirler" | "diger";
export type WritingDurum = "taslak" | "yayinda" | "arsivlendi";

export const WRITING_DURUMLAR: WritingDurum[] = [
  "taslak",
  "yayinda",
  "arsivlendi",
];

export function parseWritingDurum(raw: unknown): WritingDurum | null {
  const v = String(raw ?? "");
  return WRITING_DURUMLAR.includes(v as WritingDurum)
    ? (v as WritingDurum)
    : null;
}

export interface Writing {
  id: string;
  category: WritingCategory;
  title: string;
  body: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  tefrika_issue: string | null;
  external_url: string | null;
  durum: WritingDurum;
}

const SELECT_COLS =
  "id, category, title, body, published_at, created_at, updated_at, tefrika_issue, external_url, durum";

function mapWriting(row: Record<string, unknown>): Writing {
  const durum = parseWritingDurum(row.durum) ?? "yayinda";
  return {
    id: row.id as string,
    category: row.category as WritingCategory,
    title: (row.title as string) ?? "",
    body: (row.body as string) ?? "",
    published_at: row.published_at as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    tefrika_issue: (row.tefrika_issue as string | null) ?? null,
    external_url: (row.external_url as string | null) ?? null,
    durum,
  };
}

/** Public: yalnızca yayındaki yazılar */
export async function getWritingsPublic(): Promise<Writing[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("writings")
      .select(SELECT_COLS)
      .eq("durum", "yayinda")
      .order("published_at", { ascending: false });
    if (error) return [];
    return (data ?? []).map((r) => mapWriting(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

/** Admin: tüm durumlar */
export async function getWritingsAdmin(): Promise<Writing[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("writings")
      .select(SELECT_COLS)
      .order("published_at", { ascending: false });
    if (error) return [];
    return (data ?? []).map((r) => mapWriting(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

/** Public: tek yazı; taslak/arşiv 404 */
export async function getWritingById(id: string): Promise<Writing | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("writings")
      .select(SELECT_COLS)
      .eq("id", id)
      .eq("durum", "yayinda")
      .maybeSingle();
    if (error || !data) return null;
    return mapWriting(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

export interface WritingInsert {
  category: WritingCategory;
  title: string;
  body: string;
  published_at?: string | null;
  tefrika_issue?: string | null;
  external_url?: string | null;
  durum?: WritingDurum;
}

export async function createWriting(
  payload: WritingInsert
): Promise<Writing | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("writings")
    .insert({
      category: payload.category,
      title: payload.title.trim() || "",
      body: payload.body.trim() || "",
      published_at: payload.published_at ?? new Date().toISOString(),
      tefrika_issue: payload.tefrika_issue?.trim() || null,
      external_url: payload.external_url?.trim() || null,
      durum: payload.durum ?? "taslak",
    })
    .select(SELECT_COLS)
    .single();
  if (error) return null;
  return mapWriting(data as Record<string, unknown>);
}

export interface WritingUpdate {
  category?: WritingCategory;
  title?: string;
  body?: string;
  published_at?: string | null;
  tefrika_issue?: string | null;
  external_url?: string | null;
  durum?: WritingDurum;
}

export async function updateWriting(
  id: string,
  payload: WritingUpdate
): Promise<Writing | null> {
  const supabase = createAdminClient();
  const updates: Record<string, unknown> = {
    ...payload,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("writings")
    .update(updates)
    .eq("id", id)
    .select(SELECT_COLS)
    .single();
  if (error) return null;
  return mapWriting(data as Record<string, unknown>);
}

export async function deleteWriting(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("writings").delete().eq("id", id);
  return !error;
}
