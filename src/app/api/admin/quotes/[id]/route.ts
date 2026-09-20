import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import { deleteQuote, updateQuote } from "@/lib/quotes";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await ctx.params;
  const ok = await deleteQuote(id);
  if (!ok) return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const text = typeof body.text === "string" ? body.text : undefined;
    let page_number: number | null | undefined = undefined;
    if ("page_number" in body) {
      if (body.page_number == null || body.page_number === "") {
        page_number = null;
      } else {
        const n = Number(body.page_number);
        page_number = Number.isFinite(n) ? n : null;
      }
    }
    const updated = await updateQuote(id, { text, page_number });
    if (!updated) {
      return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
}
