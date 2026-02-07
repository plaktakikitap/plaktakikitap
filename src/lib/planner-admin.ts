/**
 * Planner write operations using createAdminClient (bypasses RLS).
 * Use for admin API routes; public reads stay in lib/planner with createServerClient.
 */
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AttachmentStyle } from "./planner";

export async function ensurePlannerDayAdmin(dateStr: string): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient();
  const [, m] = dateStr.split("-").map(Number);
  const month = m;
  const year = parseInt(dateStr.slice(0, 4), 10);

  const { data: existing } = await supabase
    .from("planner_day")
    .select("id")
    .eq("date", dateStr)
    .maybeSingle();

  if (existing) return { id: existing.id };

  const { data: inserted, error } = await supabase
    .from("planner_day")
    .insert({ date: dateStr, month, year })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: inserted.id };
}

export async function createPlannerEntryAdmin(input: {
  dayId: string;
  title?: string | null;
  content?: string | null;
  tags?: string[];
  mood?: string | null;
  summaryQuote?: string | null;
  stickerSelection?: string[] | null;
}): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("planner_entry")
    .insert({
      day_id: input.dayId,
      title: input.title?.trim() || null,
      content: input.content?.trim() || null,
      tags: input.tags ?? [],
      mood: input.mood?.trim() || null,
      summary_quote: input.summaryQuote?.trim() || null,
      sticker_selection: input.stickerSelection?.length
        ? JSON.stringify(input.stickerSelection)
        : null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function updatePlannerEntryAdmin(
  id: string,
  input: {
    title?: string | null;
    content?: string | null;
    tags?: string[];
    mood?: string | null;
    summaryQuote?: string | null;
    stickerSelection?: string[] | null;
  }
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const updates: Record<string, unknown> = {};
  if (input.title !== undefined) updates.title = input.title?.trim() || null;
  if (input.content !== undefined) updates.content = input.content?.trim() || null;
  if (input.tags !== undefined) updates.tags = input.tags ?? [];
  if (input.mood !== undefined) updates.mood = input.mood?.trim() || null;
  if (input.summaryQuote !== undefined) updates.summary_quote = input.summaryQuote?.trim() || null;
  if (input.stickerSelection !== undefined) {
    updates.sticker_selection = input.stickerSelection?.length
      ? JSON.stringify(input.stickerSelection)
      : null;
  }
  const { error } = await supabase.from("planner_entry").update(updates).eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function addPlannerMediaAdmin(input: {
  entryId: string;
  type: "image" | "video";
  url: string;
  thumbUrl?: string | null;
  attachmentType?: "paperclip" | "paste" | "staple" | null;
  attachmentStyle?: AttachmentStyle | null;
}): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient();
  const style = input.attachmentStyle ?? (input.attachmentType === "paperclip" ? "standard_clip" : input.attachmentType === "staple" ? "staple" : input.attachmentType === "paste" ? "colorful_clip" : null);

  const { data, error } = await supabase
    .from("planner_media")
    .insert({
      entry_id: input.entryId,
      type: input.type,
      url: input.url.trim(),
      thumb_url: input.thumbUrl?.trim() || null,
      attachment_type: input.attachmentType ?? null,
      attachment_style: style,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function updatePlannerMediaAdmin(
  id: string,
  input: {
    attachmentType?: "paperclip" | "paste" | "staple" | null;
    attachmentStyle?: AttachmentStyle | null;
  }
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const updates: Record<string, unknown> = {};
  if (input.attachmentType !== undefined) updates.attachment_type = input.attachmentType ?? null;
  if (input.attachmentStyle !== undefined) updates.attachment_style = input.attachmentStyle ?? null;
  const { error } = await supabase.from("planner_media").update(updates).eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function upsertDayEntryAdmin(payload: {
  date: string;
  title?: string | null;
  content?: string | null;
  photos?: string[];
  tags?: string[];
}): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("planner_day_entries")
    .select("id")
    .eq("date", payload.date)
    .maybeSingle();

  const row = {
    date: payload.date,
    title: (payload.title ?? "").trim() || null,
    content: (payload.content ?? "").trim() || null,
    photos: Array.isArray(payload.photos) ? payload.photos : [],
    tags: Array.isArray(payload.tags) ? payload.tags : [],
  };

  if (existing) {
    const { error } = await supabase.from("planner_day_entries").update(row).eq("id", existing.id);
    return error ? { error: error.message } : {};
  }
  const { error } = await supabase.from("planner_day_entries").insert(row);
  return error ? { error: error.message } : {};
}

export type PlannerElementType =
  | "photo"
  | "sticky_note"
  | "washi_tape"
  | "paperclip"
  | "sticker"
  | "text_block"
  | "doodle"
  | "coffee_stain";

export async function getOrCreateSpreadAdmin(
  year: number,
  month: number
): Promise<{ id: string; year: number; month: number } | { error: string }> {
  const supabase = createAdminClient();
  const { data: existing, error: fetchErr } = await supabase
    .from("planner_spreads")
    .select("id, year, month")
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  if (fetchErr) return { error: fetchErr.message };
  if (existing) return { id: existing.id, year: existing.year, month: existing.month };

  const { data: inserted, error: insertErr } = await supabase
    .from("planner_spreads")
    .insert({ year, month })
    .select("id, year, month")
    .single();

  if (insertErr) return { error: insertErr.message };
  return { id: inserted.id, year: inserted.year, month: inserted.month };
}

export async function upsertSpreadElementsAdmin(
  spreadId: string,
  elements: Array<{
    id?: string | null;
    page_side: "left" | "right";
    type: PlannerElementType;
    src?: string | null;
    text?: string | null;
    x: number;
    y: number;
    w: number;
    h: number;
    rotation: number;
    z_index: number;
    meta?: Record<string, unknown> | null;
  }>
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const payloadIds = new Set(elements.map((e) => e.id).filter(Boolean) as string[]);

  const { data: existing } = await supabase
    .from("planner_elements")
    .select("id")
    .eq("spread_id", spreadId);
  const toDelete = (existing ?? []).filter((r) => !payloadIds.has(r.id)).map((r) => r.id);
  for (const id of toDelete) {
    const { error } = await supabase.from("planner_elements").delete().eq("id", id);
    if (error) return { error: error.message };
  }

  for (const el of elements) {
    const x = clamp(Number(el.x), 0, 1);
    const y = clamp(Number(el.y), 0, 1);
    const w = clamp(Number(el.w), 0, 1);
    const h = clamp(Number(el.h), 0, 1);
    const rotation = Number(el.rotation) || 0;
    const z_index = Number(el.z_index) || 0;
    const payload = {
      spread_id: spreadId,
      page_side: el.page_side,
      type: el.type,
      src: (el.src ?? "").trim() || null,
      text: (el.text ?? "").trim() || null,
      x,
      y,
      w,
      h,
      rotation,
      z_index,
      meta: el.meta ?? {},
    };

    if (el.id) {
      const { error } = await supabase
        .from("planner_elements")
        .update(payload)
        .eq("id", el.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from("planner_elements").insert(payload);
      if (error) return { error: error.message };
    }
  }
  return {};
}

export async function createPlannerDecorAdmin(input: {
  year: number;
  month: number;
  page: "left" | "right";
  type: "sticker" | "tape" | "paperclip" | "pin";
  assetUrl?: string | null;
  x: number;
  y: number;
  rotation?: number;
  scale?: number;
  z?: number;
}): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("planner_decor")
    .insert({
      year: input.year,
      month: input.month,
      page: input.page,
      type: input.type,
      asset_url: input.assetUrl?.trim() || null,
      x: input.x,
      y: input.y,
      rotation: input.rotation ?? 0,
      scale: input.scale ?? 1,
      z: input.z ?? 10,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function deletePlannerDecorAdmin(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("planner_decor").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function saveCanvasItemsAdmin(
  year: number,
  month: number,
  items: Array<{
    page: "left" | "right";
    item_kind: string;
    item_key: string;
    x: number;
    y: number;
    rotation: number;
    z_index: number;
  }>
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  for (const it of items) {
    const x = Math.max(0, Math.min(1, it.x));
    const y = Math.max(0, Math.min(1, it.y));
    const { error } = await supabase
      .from("planner_canvas_item")
      .upsert(
        {
          year,
          month,
          page: it.page,
          item_kind: it.item_kind,
          item_key: it.item_key,
          x,
          y,
          rotation: it.rotation,
          z_index: it.z_index,
        },
        { onConflict: "year,month,page,item_kind,item_key" }
      );
    if (error) return { error: error.message };
  }
  return {};
}
