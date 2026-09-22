import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

export type Quote = {
  id: string;
  book_id: string | null;
  text: string;
  page_number: number | null;
  created_at: string;
};

export type QuoteWithBook = Quote & {
  book_title: string;
  book_author: string | null;
};

type QuoteRow = {
  id: string;
  book_id: string | null;
  text: string | null;
  quote?: string | null;
  page_number: number | null;
  page_num?: number | null;
  created_at: string;
  source_date?: string | null;
  book?: string | null;
  author?: string | null;
  books?:
    | { title: string; author: string | null; visibility?: string }
    | { title: string; author: string | null; visibility?: string }[]
    | null;
};

function quoteText(row: QuoteRow): string {
  return (row.text || row.quote || "").trim();
}

function quotePage(row: QuoteRow): number | null {
  return row.page_number ?? row.page_num ?? null;
}

function mapQuote(row: QuoteRow): Quote {
  return {
    id: row.id,
    book_id: row.book_id,
    text: quoteText(row),
    page_number: quotePage(row),
    created_at: row.source_date ?? row.created_at,
  };
}

function bookFromJoin(
  books: QuoteRow["books"]
): { title: string; author: string | null } | null {
  if (!books) return null;
  const b = Array.isArray(books) ? books[0] : books;
  if (!b?.title) return null;
  return { title: b.title, author: b.author ?? null };
}

function mapQuoteWithBook(row: QuoteRow): QuoteWithBook | null {
  const joined = bookFromJoin(row.books);
  const book_title = joined?.title ?? (row.book?.trim() || "");
  const text = quoteText(row);
  if (!text) return null;
  return {
    ...mapQuote(row),
    book_title: book_title || "Kitap",
    book_author: joined?.author ?? row.author ?? null,
  };
}

/** Public: bir kitabın alıntıları (tarihe göre yeni → eski) */
export async function getQuotesByBookId(bookId: string): Promise<Quote[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("quotes")
      .select("id, book_id, text, page_number, created_at")
      .eq("book_id", bookId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []).map((r) => mapQuote(r as QuoteRow));
  } catch {
    return [];
  }
}

/** Public: tüm alıntılar + kitap bilgisi */
export async function getAllQuotesPublic(): Promise<QuoteWithBook[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("quotes")
      .select(
        "id, book_id, text, quote, page_number, page_num, created_at, source_date, book, author, books(title, author)"
      )
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? [])
      .map((r) => mapQuoteWithBook(r as QuoteRow))
      .filter((q): q is QuoteWithBook => q != null);
  } catch {
    return [];
  }
}

/** Admin: bir kitabın alıntıları */
export async function getQuotesByBookIdAdmin(bookId: string): Promise<Quote[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("id, book_id, text, page_number, created_at")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((r) => mapQuote(r as QuoteRow));
}

export async function createQuote(input: {
  book_id: string;
  text: string;
  page_number?: number | null;
}): Promise<Quote | null> {
  const text = input.text.trim();
  if (!text) return null;
  const page =
    input.page_number != null && Number.isFinite(input.page_number) && input.page_number > 0
      ? Math.floor(input.page_number)
      : null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quotes")
    .insert({ book_id: input.book_id, text, page_number: page })
    .select("id, book_id, text, page_number, created_at")
    .single();
  if (error || !data) return null;
  return mapQuote(data as QuoteRow);
}

export async function deleteQuote(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  return !error;
}

export async function updateQuote(
  id: string,
  input: { text?: string; page_number?: number | null }
): Promise<Quote | null> {
  const patch: Record<string, unknown> = {};
  if (typeof input.text === "string") {
    const t = input.text.trim();
    if (!t) return null;
    patch.text = t;
  }
  if (input.page_number !== undefined) {
    patch.page_number =
      input.page_number != null &&
      Number.isFinite(input.page_number) &&
      input.page_number > 0
        ? Math.floor(input.page_number)
        : null;
  }
  if (Object.keys(patch).length === 0) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quotes")
    .update(patch)
    .eq("id", id)
    .select("id, book_id, text, page_number, created_at")
    .single();
  if (error || !data) return null;
  return mapQuote(data as QuoteRow);
}

/** Hangi kitapların alıntısı var (modal ikon için) */
export async function getBookIdsWithQuotes(): Promise<Set<string>> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.from("quotes").select("book_id");
    if (error || !data) return new Set();
    return new Set(data.map((r) => r.book_id as string));
  } catch {
    return new Set();
  }
}
