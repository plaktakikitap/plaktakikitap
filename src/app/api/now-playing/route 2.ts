import { NextResponse } from "next/server";
import { getStripMusicNowPlaying } from "@/lib/now-playing";

export const revalidate = 30;

export async function GET() {
  const data = await getStripMusicNowPlaying();
  return NextResponse.json(data);
}
