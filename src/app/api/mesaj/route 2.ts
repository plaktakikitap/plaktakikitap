import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { sanitizeText } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    const { isim, mesaj } = await req.json();

    if (!isim || isim.trim().length < 2) {
      return NextResponse.json(
        { error: "İsim en az 2 karakter olmalı" },
        { status: 400 }
      );
    }
    if (!mesaj || mesaj.trim().length < 5) {
      return NextResponse.json(
        { error: "Mesaj en az 5 karakter olmalı" },
        { status: 400 }
      );
    }
    if (mesaj.trim().length > 500) {
      return NextResponse.json(
        { error: "Mesaj en fazla 500 karakter olabilir" },
        { status: 400 }
      );
    }

    const temizIsim = sanitizeText(isim.trim());
    const temizMesaj = sanitizeText(mesaj.trim());

    const supabase = await supabaseServer();
    const { error } = await supabase.from("mesajlar").insert({
      isim: temizIsim,
      mesaj: temizMesaj,
    });

    if (error) {
      console.error("Mesaj kaydetme hatası:", error);
      return NextResponse.json(
        { error: "Bir sorun oluştu, lütfen tekrar dene" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Mesaj kaydetme hatası:", err);
    return NextResponse.json(
      { error: "Bir sorun oluştu, lütfen tekrar dene" },
      { status: 500 }
    );
  }
}
