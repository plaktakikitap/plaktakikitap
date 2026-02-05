import "server-only";
import { unstable_cache } from "next/cache";

/**
 * YouTube Data API v3 – abone sayısı.
 * channelId: Kanal ID (UC...). YOUTUBE_API_KEY gerekli.
 * 1 saat cache.
 */
async function fetchSubscriberCountUncached(channelId: string): Promise<number | null> {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) return null;

  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "statistics");
  url.searchParams.set("id", channelId);
  url.searchParams.set("key", key);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      items?: Array<{ statistics?: { subscriberCount?: string } }>;
    };
    const count = data?.items?.[0]?.statistics?.subscriberCount;
    if (count == null) return null;
    const n = parseInt(count, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** Cache key: plaktaki-kitap-subscribers-{channelId}, 1 hour */
export function getYouTubeSubscriberCount(channelId: string | null): Promise<number | null> {
  if (!channelId?.trim()) return Promise.resolve(null);
  const id = channelId.trim();
  return unstable_cache(
    () => fetchSubscriberCountUncached(id),
    [`plaktaki-kitap-subscribers-${id}`],
    { revalidate: 3600, tags: [`youtube-subscribers-${id}`] }
  )();
}
