export type ContentSegment =
  | { type: "text"; text: string }
  | { type: "spoiler"; text: string };

const SPOILER_RE = /\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi;

export function parseSpoilers(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const regex = new RegExp(SPOILER_RE.source, SPOILER_RE.flags);
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", text: content.slice(lastIndex, match.index) });
    }
    segments.push({ type: "spoiler", text: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: "text", text: content.slice(lastIndex) });
  }

  return segments;
}

export function hasSpoilerMarkup(content: string): boolean {
  return /\[spoiler\]/i.test(content);
}

/** Önizleme / meta için spoiler gövdesini ve etiketleri çıkarır. */
export function stripSpoilers(content: string): string {
  return content
    .replace(/\[spoiler\][\s\S]*?\[\/spoiler\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
