import { NextResponse } from "next/server";
import { getPlaktakiKitapSettings } from "@/lib/plaktaki-kitap";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

async function fetchSubscriberCount(channelId: string): Promise<number | null> {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) return null;
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "statistics");
  url.searchParams.set("id", channelId);
  url.searchParams.set("key", key);
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    items?: Array<{ statistics?: { subscriberCount?: string } }>;
  };
  const count = data?.items?.[0]?.statistics?.subscriberCount;
  if (count == null) return null;
  const n = parseInt(count, 10);
  return Number.isFinite(n) ? n : null;
}

export async function GET() {
  try {
    const settings = await getPlaktakiKitapSettings();
    const channelId = settings?.youtube_channel_id?.trim();
    if (!channelId) {
      return NextResponse.json({ subscriberCount: null });
    }
    const subscriberCount = await fetchSubscriberCount(channelId);
    return NextResponse.json({ subscriberCount });
  } catch {
    return NextResponse.json({ subscriberCount: null });
  }
}
