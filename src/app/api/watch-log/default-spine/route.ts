import { NextRequest, NextResponse } from "next/server";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Yan kapak yüklenmezse kullanılacak default "Gold & Glass" DVD spine SVG.
 * Başlığı dikey yazar; img src olarak kullanılabilir.
 */
export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title")?.slice(0, 80) || "DVD";
  const safeTitle = escapeXml(title);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 82 430" width="82" height="430">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#d4af37"/>
      <stop offset="50%" style="stop-color:#f4d03f"/>
      <stop offset="100%" style="stop-color:#c5a028"/>
    </linearGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.35)"/>
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.05)"/>
    </linearGradient>
  </defs>
  <rect width="82" height="430" fill="url(#gold)" rx="2"/>
  <rect width="82" height="430" fill="url(#glass)" rx="2"/>
  <text x="41" y="215" text-anchor="middle" fill="#1a1a1a" font-family="system-ui, sans-serif" font-size="11" font-weight="600" transform="rotate(-90 41 215)">${safeTitle}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
