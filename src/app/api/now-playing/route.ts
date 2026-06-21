import { NextResponse } from "next/server";
import { getNowPlaying } from "@/lib/lastfm";

export const revalidate = 30;

export async function GET() {
  const data = await getNowPlaying();
  return NextResponse.json(data);
}
