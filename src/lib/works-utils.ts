/**
 * Client-safe helpers for works (no server-only, no Supabase).
 * Use in client components. For server use lib/works.ts.
 */

/** Standard 11-char YouTube video ID regex */
const YT_VIDEO_ID_REGEX = /[a-zA-Z0-9_-]{11}/;

/**
 * Parse YouTube video ID from any common URL format.
 * Supports: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID, youtube.com/embed/ID, youtube.com/v/ID
 */
export function parseYouTubeVideoId(url: string | null): string | null {
  if (!url?.trim()) return null;
  const s = url.trim();
  // youtu.be/VIDEO_ID
  const be = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?|$)/);
  if (be) return be[1];
  // youtube.com/watch?v=VIDEO_ID or &v=VIDEO_ID
  const watch = s.match(/(?:youtube\.com\/watch\?.*[&?]v=)([a-zA-Z0-9_-]{11})/);
  if (watch) return watch[1];
  // youtube.com/shorts/VIDEO_ID
  const shorts = s.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shorts) return shorts[1];
  // youtube.com/embed/VIDEO_ID or /v/VIDEO_ID
  const embed = s.match(/youtube\.com\/(?:embed|v)\/([a-zA-Z0-9_-]{11})/);
  if (embed) return embed[1];
  // Fallback: any 11-char id in the string (last resort)
  const fallback = s.match(YT_VIDEO_ID_REGEX);
  return fallback ? fallback[0] : null;
}

export function getYouTubeThumbUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/** HQ default thumbnail (more reliable than maxresdefault for some videos) */
export function getYouTubeHqDefaultThumbUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
