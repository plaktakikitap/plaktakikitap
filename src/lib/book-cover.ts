/** Client-safe cover URL helpers. 1000kitap hotlinks 403 (Cloudflare). */

const DEAD_COVER_HOSTS = ["1000kitap.com"];

export function usableBookCoverUrl(
  url: string | null | undefined
): string | null {
  const v = url?.trim();
  if (!v) return null;
  let host = "";
  try {
    host = new URL(v).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (DEAD_COVER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    return null;
  }
  if (!/^https?:\/\//i.test(v)) return null;
  return v;
}
