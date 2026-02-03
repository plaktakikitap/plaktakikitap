import { NextResponse } from "next/server";
import { getSpotifyNowPlaying } from "@/lib/spotify";

export const revalidate = 30;

export async function GET() {
  const data = await getSpotifyNowPlaying();
  return NextResponse.json(data);
}
