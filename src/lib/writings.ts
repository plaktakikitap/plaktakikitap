import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type WritingCategory = "denemeler" | "siirler" | "diger";

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
}

/** Public: all writings, newest first per category */
export async function getWritingsPublic(): Promise<Writing[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("writings")
      .select("id, category, title, body, published_at, created_at, updated_at, tefrika_issue, external_url")
      .order("published_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as Writing[];
  } catch {
    return [];
  }
}

/** Public: single writing by id */
export async function getWritingById(id: string): Promise<Writing | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("writings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return data as Writing;
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
}

export async function createWriting(payload: WritingInsert): Promise<Writing | null> {
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
    })
    .select()
    .single();
  if (error) return null;
  return data as Writing;
}

export interface WritingUpdate {
  category?: WritingCategory;
  title?: string;
  body?: string;
  published_at?: string | null;
  tefrika_issue?: string | null;
  external_url?: string | null;
}

export async function updateWriting(id: string, payload: WritingUpdate): Promise<Writing | null> {
  const supabase = createAdminClient();
  const updates: Record<string, unknown> = { ...payload, updated_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from("writings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data as Writing;
}

export async function deleteWriting(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("writings").delete().eq("id", id);
  return !error;
}
