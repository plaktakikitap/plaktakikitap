import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export type StackBook = {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  spine_color: string | null;
  status: string;
};

export type ReadingStackPayload = {
  current: StackBook | null;
  stack: StackBook[];
};

function mapRow(row: Record<string, unknown>): StackBook {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    author: String(row.author ?? ""),
    cover_url: (row.cover_url as string | null) ?? null,
    spine_color: (row.spine_color as string | null) ?? null,
    status: String(row.status ?? ""),
  };
}

/**
 * Şu an okunan + altında 2 son biten kitap.
 * current: is_featured_current veya status=reading (en güncel)
 * stack: [current, finished1, finished2] — en fazla 3
 */
export async function GET() {
  try {
    const supabase = await createServerClient();
    const visibility = ["public", "unlisted"] as const;

    let current: StackBook | null = null;

    const { data: featured } = await supabase
      .from("books")
      .select("id, title, author, cover_url, spine_color, status")
      .eq("status", "reading")
      .eq("is_featured_current", true)
      .in("visibility", [...visibility])
      .limit(1)
      .maybeSingle();

    if (featured) {
      current = mapRow(featured as Record<string, unknown>);
    } else {
      const { data: reading } = await supabase
        .from("books")
        .select("id, title, author, cover_url, spine_color, status")
        .eq("status", "reading")
        .in("visibility", [...visibility])
        .order("last_progress_update_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (reading) current = mapRow(reading as Record<string, unknown>);
    }

    const { data: finished } = await supabase
      .from("books")
      .select("id, title, author, cover_url, spine_color, status")
      .eq("status", "finished")
      .in("visibility", [...visibility])
      .order("end_date", { ascending: false })
      .limit(4);

    const finishedList = (finished ?? [])
      .map((r) => mapRow(r as Record<string, unknown>))
      .filter((b) => b.id !== current?.id);

    const stack: StackBook[] = [];
    if (current) stack.push(current);
    for (const b of finishedList) {
      if (stack.length >= 3) break;
      stack.push(b);
    }

    // Current yoksa ama finished varsa yine stack göster (ilk finished "üst")
    if (stack.length === 0 && finishedList.length > 0) {
      stack.push(...finishedList.slice(0, 3));
    }

    if (stack.length === 0) {
      return NextResponse.json({ current: null, stack: [] } satisfies ReadingStackPayload);
    }

    return NextResponse.json({
      current: current ?? stack[0] ?? null,
      stack,
    } satisfies ReadingStackPayload);
  } catch {
    return NextResponse.json({ current: null, stack: [] } satisfies ReadingStackPayload);
  }
}
