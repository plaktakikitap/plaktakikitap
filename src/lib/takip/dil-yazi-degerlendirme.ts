import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { isDil, type Dil } from "@/types/dil-ogrenme";

export type YaziDegerlendirme = {
  puan: number;
  gramer: string;
  kelime_kullanimi: string;
  oneri: string;
  iyi_yonler?: string;
};

const DIL_ADI: Record<Dil, string> = {
  ingilizce: "English",
  fransizca: "French",
  almanca: "German",
};

function stripFence(raw: string): string {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function mapDegerlendirme(parsed: Record<string, unknown>): YaziDegerlendirme {
  const puan = Number(parsed.puan);
  return {
    puan: Number.isFinite(puan) ? Math.max(0, Math.min(100, Math.round(puan))) : 0,
    gramer: String(parsed.gramer ?? ""),
    kelime_kullanimi: String(
      parsed.kelime_kullanimi ?? parsed.kelime_kullanim ?? ""
    ),
    oneri: String(parsed.oneri ?? ""),
    iyi_yonler: parsed.iyi_yonler ? String(parsed.iyi_yonler) : undefined,
  };
}

export type YaziDegerlendirmeSonuc =
  | { ok: true; data: YaziDegerlendirme }
  | { ok: false; puan: number | null; oneri?: string; hata: string };

export async function degerlendirYazi(
  metin: string,
  dil: Dil
): Promise<YaziDegerlendirmeSonuc> {
  const text = metin.trim();
  if (!text || !isDil(dil)) {
    return { ok: false, puan: null, hata: "Eksik parametre" };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, puan: null, hata: "ANTHROPIC_API_KEY tanımlı değil." };
  }

  const dilAdi = DIL_ADI[dil];
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: `You are a strict but encouraging ${dilAdi} language teacher evaluating a student's writing assignment. The student is a Turkish speaker learning ${dilAdi}.

Evaluate this text and respond ONLY with a JSON object (no markdown, no explanation outside JSON):
{
  "puan": <0-100 integer>,
  "gramer": "<1-2 sentences on grammar in Turkish>",
  "kelime_kullanimi": "<1-2 sentences on vocabulary use in Turkish>",
  "oneri": "<1 specific improvement suggestion in Turkish>",
  "iyi_yonler": "<what they did well, in Turkish>"
}

Student's text in ${dilAdi}:
${text}`,
      },
    ],
  });

  const content = msg.content[0];
  if (content.type !== "text") {
    return { ok: false, puan: null, hata: "AI yanıtı alınamadı" };
  }

  try {
    const parsed = JSON.parse(stripFence(content.text)) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("not object");
    }
    return { ok: true, data: mapDegerlendirme(parsed as Record<string, unknown>) };
  } catch {
    return {
      ok: false,
      puan: 50,
      oneri: content.text,
      hata: "parse hatası",
    };
  }
}
