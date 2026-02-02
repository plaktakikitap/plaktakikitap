/**
 * Extract embed URL for YouTube or Vimeo.
 * Returns null if not a supported video URL.
 */
export function getVideoEmbedUrl(url: string): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();

  // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const ytMatch = u.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo: vimeo.com/ID, player.vimeo.com/video/ID
  const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

export function isVideoEmbedUrl(url: string): boolean {
  return getVideoEmbedUrl(url) !== null;
}
