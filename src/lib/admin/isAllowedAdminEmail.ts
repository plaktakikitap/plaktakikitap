/**
 * Tek kaynak: admin e-posta whitelist kontrolü.
 * ADMIN_ALLOWED_EMAIL env değeri (virgülle ayrılmış) ile kullanıcı e-postasını karşılaştırır.
 */

function normalizeAllowedPart(part: string): string {
  return part.trim().replace(/^["']|["']$/g, "").toLowerCase();
}

/** Env'den izinli e-postaları parse eder (trim, tırnak temizliği, lowercase). */
export function getNormalizedAllowedEmails(): string[] {
  const raw = (process.env.ADMIN_ALLOWED_EMAIL ?? "").trim();
  return raw
    .split(",")
    .map((e) => normalizeAllowedPart(e))
    .filter(Boolean);
}

/** Kullanıcı e-postasını karşılaştırma için normalize eder. */
export function normalizeUserEmail(email?: string | null): string {
  return (email ?? "").trim().toLowerCase();
}

/**
 * Verilen e-posta admin whitelist'te mi kontrol eder.
 * Hiçbir yerde farklı mantık kullanılmamalı; tüm admin erişim kontrolleri bu fonksiyona bağlıdır.
 */
export function isAllowedAdminEmail(userEmail?: string | null): boolean {
  const allowedRaw = process.env.ADMIN_ALLOWED_EMAIL ?? "";
  const allowedNormalized = getNormalizedAllowedEmails();
  const userEmailRaw = userEmail ?? "";
  const userEmailNormalized = normalizeUserEmail(userEmail);

  const allowed =
    !!userEmailNormalized &&
    allowedNormalized.length > 0 &&
    allowedNormalized.includes(userEmailNormalized);

  if (process.env.NODE_ENV !== "production") {
    console.log("ADMIN_WHITELIST:", {
      allowedRaw,
      allowedNormalized,
      userEmailRaw,
      userEmailNormalized,
      isAllowed: allowed,
    });
  }

  return allowed;
}
