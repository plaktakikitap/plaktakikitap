/** Unix saniye, ISO string veya Date → "3 dakika önce" gibi Türkçe göreli zaman. */
export function formatRelativeTimeTr(from: Date | string | number): string {
  const thenMs =
    from instanceof Date
      ? from.getTime()
      : typeof from === "number"
        ? from * 1000
        : new Date(from).getTime();

  if (Number.isNaN(thenMs)) return "";

  const diffSec = Math.max(0, Math.floor((Date.now() - thenMs) / 1000));

  if (diffSec < 60) return "az önce";

  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins} dakika önce`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ay önce`;

  const years = Math.floor(days / 365);
  return `${years} yıl önce`;
}
