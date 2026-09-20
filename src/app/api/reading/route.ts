import { NextResponse } from "next/server";

export type CurrentlyReadingBook = {
  title: string;
  author: string;
  cover: string | null;
  note: string;
};

/** Şimdilik statik; sonra CMS / books tablosuna bağlanacak */
const CURRENT: CurrentlyReadingBook = {
  title: "Ahlakiliğin Doğası",
  author: "Ömer Türker",
  cover: "/covers/ahlak.jpg",
  note: "Metaetik üzerine yavaş okuma — satır satır not alıyorum.",
};

export async function GET() {
  return NextResponse.json(CURRENT);
}
