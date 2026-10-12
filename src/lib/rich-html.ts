const ALLOWED = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "hr",
  "a",
  "span",
]);

const RICH_TAG =
  /<\/?(?:p|br|strong|b|em|i|u|s|strike|h2|h3|ul|ol|li|blockquote|code|pre|hr|a|span)\b/i;

export function isRichHtml(content: string): boolean {
  return RICH_TAG.test(content);
}

/** Boş editör (`<p></p>`) ile gerçek metni ayırır. */
export function richTextIsEmpty(value: string): boolean {
  return !value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
}

export function sanitizeRichHtml(html: string): string {
  const stripped = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?(iframe|object|embed|link|meta|form|input|button|textarea|svg|math)\b[^>]*>/gi, "");

  return stripped
    .replace(/<([a-z0-9]+)([^>]*)>/gi, (_full, rawTag: string, attrs: string) => {
      const name = rawTag.toLowerCase();
      if (!ALLOWED.has(name)) return "";
      if (name === "br" || name === "hr") return `<${name}>`;
      if (name !== "a") return `<${name}>`;
      const href = /href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
      const url = (href?.[1] ?? href?.[2] ?? href?.[3] ?? "").trim();
      if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) return "<a>";
      const safe = url.replace(/"/g, "");
      return `<a href="${safe}" rel="noopener noreferrer" target="_blank">`;
    })
    .replace(/<\/([a-z0-9]+)>/gi, (_full, rawTag: string) => {
      const name = rawTag.toLowerCase();
      return ALLOWED.has(name) ? `</${name}>` : "";
    });
}
