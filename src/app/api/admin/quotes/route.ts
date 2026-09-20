import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import {
  createQuote,
  getQuotesByBookIdAdmin,
} from "@/lib/quotes";

/** GET ?book_id= — admin: kitabın alıntıları */
export async function GET(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const bookId = req.nextUrl.searchParams.get("book_id");
  if (!bookId) {
    return NextResponse.json({ error: "book_id gerekli" }, { status: 400 });
  }
  const items = await getQuotesByBookIdAdmin(bookId);
  return NextResponse.json(items);
}

/** POST { book_id, text, page_number? } */
export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const body = await req.json();
    const book_id = typeof body.book_id === "string" ? body.book_id : "";
    const text = typeof body.text === "string" ? body.text : "";
    let page_number: number | null = null;
    if (body.page_number != null && body.page_number !== "") {
      const n = Number(body.page_number);
      page_number = Number.isFinite(n) ? n : null;
    }
    if (!book_id || !text.trim()) {
      return NextResponse.json(
        { error: "book_id ve text gerekli" },
        { status: 400 }
      );
    }
    const created = await createQuote({ book_id, text, page_number });
    if (!created) {
      return NextResponse.json({ error: "Oluşturulamadı" }, { status: 500 });
    }
    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
}
