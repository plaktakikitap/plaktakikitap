const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
] as const;

/** Sunucu ve tarayıcıda aynı günü üretir (İstanbul). */
export function formatDateTr(iso: string): { key: string; label: string } {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { key: iso, label: "" };

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const month = Number(get("month"));
  const day = get("day");
  const year = get("year");

  return {
    key: `${year}-${month}-${day}`,
    label: `${day} ${MONTHS[month - 1] ?? ""} ${year}`.trim(),
  };
}
