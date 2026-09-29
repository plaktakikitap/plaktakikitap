import { NextRequest, NextResponse } from "next/server";
import { normalizeSayfaYolu, recordPageView } from "@/lib/analytics/pageviews";

export const dynamic = "force-dynamic";

const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit/i;

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  if (BOT_RE.test(ua)) return NextResponse.json({ ok: true });

  try {
    const body = await req.json();
    const yol = normalizeSayfaYolu(body?.yol);
    if (!yol) return NextResponse.json({ ok: true });
    await recordPageView(yol);
  } catch {
    /* swallow — tracking must never break the site */
  }
  return NextResponse.json({ ok: true });
}
