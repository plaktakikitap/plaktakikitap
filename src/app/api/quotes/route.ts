import { NextRequest, NextResponse } from "next/server";
import { getAllQuotesPublic, getQuotesByBookId } from "@/lib/quotes";

/** GET /api/quotes — tüm public alıntılar
 *  GET /api/quotes?book_id= — bir kitabın alıntıları
 */
export async function GET(req: NextRequest) {
  const bookId = req.nextUrl.searchParams.get("book_id");
  if (bookId) {
    const items = await getQuotesByBookId(bookId);
    return NextResponse.json(items);
  }
  const items = await getAllQuotesPublic();
  return NextResponse.json(items);
}
