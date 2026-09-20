import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { BeslenmeAiAnaliz } from "@/types/takip";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi(req);
  if (denied) return denied;

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY tanımlı değil." },
        { status: 500 }
      );
    }
    const body = await req.json();
    const yemekler =
      typeof body.yemekler === "string" ? body.yemekler.trim() : "";
    if (!yemekler) {
      return NextResponse.json({ error: "Yemek listesi gerekli." }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Aşağıdaki yemekleri analiz et ve JSON formatında yanıt ver.
Sadece JSON döndür, başka hiçbir şey yazma.

Yemekler: ${yemekler}

JSON formatı:
{
  "tahmini_kalori": number,
  "protein_g": number,
  "karbonhidrat_g": number,
  "yag_g": number,
  "deger_lendirme": "kısa bir cümle (Türkçe)",
  "eksik_besin": ["varsa eksik besin grupları"]
}

Not: Bu bir tahmindir, kesin değildir.`,
        },
      ],
    });

    const block = response.content[0];
    const text = block.type === "text" ? block.text : "{}";
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: BeslenmeAiAnaliz;
    try {
      parsed = JSON.parse(cleaned) as BeslenmeAiAnaliz;
    } catch {
      return NextResponse.json(
        { error: "Analiz yapılamadı." },
        { status: 500 }
      );
    }
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("beslenme-analiz:", err);
    return NextResponse.json(
      { error: "Analiz sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
