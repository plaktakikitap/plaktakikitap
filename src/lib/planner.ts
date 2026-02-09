import "server-only";
import { createServerClient } from "@/lib/supabase/server";

export type SmudgePreset = "fingerprint" | "smudge_blob" | "smudge_stain" | "ink_bleed";

export interface DaySmudgeData {
  preset: SmudgePreset;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
}

/** Modal/API için — tüm alanlar opsiyonel */
export type DaySmudge =
  | { preset?: string; x?: number; y?: number; rotation?: number; opacity?: number }
  | null;

export interface PlannerDaySummary {
  date: string;
  dayId: string;
  entryCount: number;
  firstEntryTitle: string | null;
  firstEntryContent: string | null;
  firstImageUrl: string | null;
  summaryQuote: string | null;
  imageUrls: string[];
  paperclipImageUrls: string[];
  attachedImages: { url: string; style: AttachmentStyle }[];
  isBusy: boolean;
  smudge?: DaySmudgeData | null;
}

export interface PlannerDecor {
  id: string;
  year: number;
  month: number;
  page: "left" | "right";
  type: "sticker" | "tape" | "paperclip" | "pin";
  assetUrl: string | null;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  z: number;
}

export type AttachmentType = "paperclip" | "paste" | "staple";

export type AttachmentStyle = "standard_clip" | "colorful_clip" | "binder_clip" | "staple";

export interface PlannerEntryWithMedia {
  id: string;
  dayId: string;
  title: string | null;
  content: string | null;
  tags: string[];
  mood: string | null;
  summaryQuote: string | null;
  stickerSelection: string[] | null;
  createdAt: string;
  media: {
    id: string;
    type: "image" | "video";
    url: string;
    thumbUrl: string | null;
    attachmentType: AttachmentType | null;
    attachmentStyle?: AttachmentStyle | null;
  }[];
}

/** Seçili ay/yıl için gün özetleri (preview) */
export async function fetchPlannerMonthSummary(
  year: number,
  month: number
): Promise<PlannerDaySummary[]> {
  const supabase = await createServerClient();
  const m = month + 1;
  const start = `${year}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const end = `${year}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data: days, error: daysErr } = await supabase
    .from("planner_day")
    .select("id, date")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });

  if (daysErr || !days?.length) return [];

  const result: PlannerDaySummary[] = [];

  async function signUrl(path: string): Promise<string> {
    if (!path || path.startsWith("http")) return path;
    const { data } = await supabase.storage
      .from("planner_media")
      .createSignedUrl(path, 3600);
    return data?.signedUrl ?? path;
  }

  const { data: smudges } = await supabase
    .from("planner_day_smudge")
    .select("date, preset, x, y, rotation, opacity")
    .in("date", days.map((x) => x.date));

  const smudgeByDate = new Map<string, DaySmudgeData>();
  for (const s of smudges ?? []) {
    smudgeByDate.set(s.date, {
      preset: s.preset as DaySmudgeData["preset"],
      x: s.x ?? 0.3,
      y: s.y ?? 0.5,
      rotation: s.rotation ?? 0,
      opacity: s.opacity ?? 0.15,
    });
  }

  for (const d of days) {
    const { data: entries } = await supabase
      .from("planner_entry")
      .select("id, title, content, summary_quote")
      .eq("day_id", d.id)
      .order("created_at", { ascending: true });

    const entryCount = entries?.length ?? 0;
    const first = entries?.[0];
    const summaryQuote = first?.summary_quote ?? null;
    const isBusy = entryCount >= 3;

    const imageUrls: string[] = [];
    const paperclipImageUrls: string[] = [];
    const attachedImages: { url: string; style: AttachmentStyle }[] = [];

    const toStyle = (at: string | null, as: string | null): AttachmentStyle | null => {
      const s = as ?? (at === "paperclip" ? "standard_clip" : at === "staple" ? "staple" : at === "paste" ? "colorful_clip" : null);
      if (s === "standard_clip" || s === "colorful_clip" || s === "binder_clip" || s === "staple") return s;
      return null;
    };

    for (const ent of entries ?? []) {
      const { data: media } = await supabase
        .from("planner_media")
        .select("url, thumb_url, attachment_type, attachment_style")
        .eq("entry_id", ent.id)
        .eq("type", "image")
        .order("created_at", { ascending: true });

      for (const m of media ?? []) {
        const raw = m.thumb_url || m.url;
        if (!raw) continue;
        const url = await signUrl(raw);
        imageUrls.push(url);
        const style = toStyle(m.attachment_type, m.attachment_style);
        if (style) {
          paperclipImageUrls.push(url);
          attachedImages.push({ url, style });
        }
      }
    }

    let firstImageUrl: string | null = imageUrls[0] ?? null;

    result.push({
      date: d.date,
      dayId: d.id,
      entryCount,
      firstEntryTitle: first?.title ?? null,
      firstEntryContent: first?.content ?? null,
      firstImageUrl,
      summaryQuote,
      imageUrls,
      paperclipImageUrls,
      attachedImages,
      isBusy,
      smudge: smudgeByDate.get(d.date) ?? null,
    });
  }

  return result;
}

/** Seçili ay/yıl için decor listesi */
export async function fetchDecor(
  year: number,
  month: number
): Promise<PlannerDecor[]> {
  const supabase = await createServerClient();
  const m = month + 1;

  const { data, error } = await supabase
    .from("planner_decor")
    .select("id, year, month, page, type, asset_url, x, y, rotation, scale, z")
    .eq("year", year)
    .eq("month", m)
    .order("z", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return [];

  return (data ?? []).map((d) => ({
    id: d.id,
    year: d.year,
    month: d.month,
    page: d.page as "left" | "right",
    type: d.type as "sticker" | "tape" | "paperclip" | "pin",
    assetUrl: d.asset_url,
    x: d.x,
    y: d.y,
    rotation: d.rotation,
    scale: d.scale,
    z: d.z,
  }));
}

/** Tek günün detayı (modal lazy load) */
export async function fetchPlannerDayDetail(
  dateStr: string
): Promise<PlannerEntryWithMedia[]> {
  const supabase = await createServerClient();

  const { data: day, error: dayErr } = await supabase
    .from("planner_day")
    .select("id")
    .eq("date", dateStr)
    .maybeSingle();

  if (dayErr || !day) return [];

  const { data: entries, error: entriesErr } = await supabase
    .from("planner_entry")
    .select("id, title, content, tags, mood, summary_quote, sticker_selection, created_at")
    .eq("day_id", day.id)
    .order("created_at", { ascending: true });

  if (entriesErr || !entries?.length) return [];

  const result: PlannerEntryWithMedia[] = [];

  for (const e of entries) {
    const { data: media } = await supabase
      .from("planner_media")
      .select("id, type, url, thumb_url, attachment_type, attachment_style")
      .eq("entry_id", e.id)
      .order("created_at", { ascending: true });

    const mediaList: PlannerEntryWithMedia["media"] = [];
    for (const m of media ?? []) {
      let url = m.url;
      let thumbUrl = m.thumb_url;
      if (!m.url.startsWith("http")) {
        const { data: signed } = await supabase.storage
          .from("planner_media")
          .createSignedUrl(m.url, 3600);
        url = signed?.signedUrl ?? m.url;
      }
      if (m.thumb_url && !m.thumb_url.startsWith("http")) {
        const { data: signedThumb } = await supabase.storage
          .from("planner_media")
          .createSignedUrl(m.thumb_url, 3600);
        thumbUrl = signedThumb?.signedUrl ?? m.thumb_url;
      }
      mediaList.push({
        id: m.id,
        type: m.type as "image" | "video",
        url,
        thumbUrl,
        attachmentType: (m.attachment_type as PlannerEntryWithMedia["media"][0]["attachmentType"]) ?? null,
        attachmentStyle: (m.attachment_style && ["standard_clip","colorful_clip","binder_clip","staple"].includes(m.attachment_style) ? m.attachment_style : m.attachment_type === "paperclip" ? "standard_clip" : m.attachment_type === "staple" ? "staple" : m.attachment_type === "paste" ? "colorful_clip" : null) as PlannerEntryWithMedia["media"][0]["attachmentStyle"],
      });
    }

    let stickerSelection: string[] | null = null;
    if (e.sticker_selection) {
      try {
        stickerSelection = JSON.parse(e.sticker_selection) as string[];
      } catch {
        // ignore
      }
    }

    result.push({
      id: e.id,
      dayId: day.id,
      title: e.title,
      content: e.content,
      tags: e.tags ?? [],
      mood: e.mood,
      summaryQuote: e.summary_quote ?? null,
      stickerSelection,
      createdAt: e.created_at,
      media: mediaList,
    });
  }

  return result;
}

/** planner_day yoksa oluştur, varsa id döndür */
export async function ensurePlannerDay(
  dateStr: string
): Promise<{ id: string } | { error: string }> {
  const supabase = await createServerClient();

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

/** Entry oluştur */
export async function createPlannerEntry(input: {
  dayId: string;
  title?: string | null;
  content?: string | null;
  tags?: string[];
  mood?: string | null;
  summaryQuote?: string | null;
  stickerSelection?: string[] | null;
}): Promise<{ id: string } | { error: string }> {
  const supabase = await createServerClient();

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

/** Entry güncelle */
export async function updatePlannerEntry(
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
  const supabase = await createServerClient();
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

/** Media güncelle */
export async function updatePlannerMedia(
  id: string,
  input: {
    attachmentType?: "paperclip" | "paste" | "staple" | null;
    attachmentStyle?: AttachmentStyle | null;
  }
): Promise<{ error?: string }> {
  const supabase = await createServerClient();
  const updates: Record<string, unknown> = {};
  if (input.attachmentType !== undefined) updates.attachment_type = input.attachmentType ?? null;
  if (input.attachmentStyle !== undefined) updates.attachment_style = input.attachmentStyle ?? null;
  const { error } = await supabase.from("planner_media").update(updates).eq("id", id);
  if (error) return { error: error.message };
  return {};
}

/** Media ekle */
export async function addPlannerMedia(input: {
  entryId: string;
  type: "image" | "video";
  url: string;
  thumbUrl?: string | null;
  attachmentType?: "paperclip" | "paste" | "staple" | null;
  attachmentStyle?: AttachmentStyle | null;
}): Promise<{ id: string } | { error: string }> {
  const supabase = await createServerClient();
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

/** Decor ekle */
export async function createPlannerDecor(input: {
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
  const supabase = await createServerClient();

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

/** Decor sil */
export async function deletePlannerDecor(id: string): Promise<{ error?: string }> {
  const supabase = await createServerClient();
  const { error } = await supabase.from("planner_decor").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}

// --- planner_spreads + planner_elements (migration 046) ---

export interface PlannerSpread {
  id: string;
  year: number;
  month: number;
  created_at?: string;
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

export interface PlannerElement {
  id: string;
  spread_id: string;
  page_side: "left" | "right";
  type: PlannerElementType;
  src: string | null;
  text: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  z_index: number;
  meta: Record<string, unknown>;
  created_at?: string;
}

/** Get or create spread for year/month (month 1–12). */
export async function getOrCreateSpread(
  year: number,
  month: number
): Promise<{ id: string; year: number; month: number } | { error: string }> {
  const supabase = await createServerClient();
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

/** List all elements for a spread. */
export async function getSpreadElements(spreadId: string): Promise<PlannerElement[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("planner_elements")
    .select("id, spread_id, page_side, type, src, text, x, y, w, h, rotation, z_index, meta, created_at")
    .eq("spread_id", spreadId)
    .order("z_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return [];

  return (data ?? []).map((row) => ({
    id: row.id,
    spread_id: row.spread_id,
    page_side: row.page_side as "left" | "right",
    type: row.type as PlannerElementType,
    src: row.src,
    text: row.text,
    x: row.x,
    y: row.y,
    w: row.w,
    h: row.h,
    rotation: row.rotation,
    z_index: row.z_index,
    meta: (row.meta as Record<string, unknown>) ?? {},
    created_at: row.created_at,
  }));
}

/** Upsert elements for a spread. Keeps payload items; deletes spread elements whose id is not in the payload. */
export async function upsertSpreadElements(
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
  const supabase = await createServerClient();
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

/** planner_day_entries: one row per date */
export interface PlannerDayEntry {
  id: string;
  date: string;
  title: string | null;
  content: string | null;
  photos: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export async function getDayEntry(date: string): Promise<PlannerDayEntry | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("planner_day_entries")
    .select("id, date, title, content, photos, tags, created_at, updated_at")
    .eq("date", date)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    date: data.date,
    title: data.title,
    content: data.content,
    photos: Array.isArray(data.photos) ? data.photos : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function upsertDayEntry(payload: {
  date: string;
  title?: string | null;
  content?: string | null;
  photos?: string[];
  tags?: string[];
}): Promise<{ error?: string }> {
  const supabase = await createServerClient();
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

/** Canvas item: tek bir öğenin sayfa üzerindeki konumu (x, y 0–1, rotation derece) */
export type PlannerCanvasItemKind =
  | "attached_photo"
  | "polaroid"
  | "note"
  | "custom_field"
  | "paperclip"
  | "washi";

export interface PlannerCanvasItem {
  id: string;
  year: number;
  month: number;
  page: "left" | "right";
  item_kind: PlannerCanvasItemKind;
  item_key: string;
  x: number;
  y: number;
  rotation: number;
  z_index: number;
}

/** Seçili ay için tüm canvas öğelerini getir */
export async function fetchCanvasItems(
  year: number,
  month: number
): Promise<PlannerCanvasItem[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("planner_canvas_item")
    .select("id, year, month, page, item_kind, item_key, x, y, rotation, z_index")
    .eq("year", year)
    .eq("month", month)
    .order("z_index", { ascending: true })
    .order("page", { ascending: true });

  if (error) return [];

  return (data ?? []).map((row) => ({
    id: row.id,
    year: row.year,
    month: row.month,
    page: row.page as "left" | "right",
    item_kind: row.item_kind as PlannerCanvasItemKind,
    item_key: row.item_key,
    x: row.x,
    y: row.y,
    rotation: row.rotation,
    z_index: row.z_index,
  }));
}

/** Canvas öğelerini kaydet (upsert: year, month, page, item_kind, item_key ile) */
export async function saveCanvasItems(
  year: number,
  month: number,
  items: Array<{
    page: "left" | "right";
    item_kind: PlannerCanvasItemKind;
    item_key: string;
    x: number;
    y: number;
    rotation: number;
    z_index: number;
  }>
): Promise<{ error?: string }> {
  const supabase = await createServerClient();
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
        {
          onConflict: "year,month,page,item_kind,item_key",
        }
      );
    if (error) return { error: error.message };
  }
  return {};
}
