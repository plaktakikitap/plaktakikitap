import type { AliskanlikKayit } from "@/types/takip";

export async function postAliskanlik<T>(
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch("/api/admin/aliskanliklar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || "İşlem başarısız.");
  }
  return data;
}

export function replaceLog(
  logs: AliskanlikKayit[],
  next: AliskanlikKayit
): AliskanlikKayit[] {
  const rest = logs.filter(
    (l) => !(l.aliskanlik_id === next.aliskanlik_id && l.tarih === next.tarih)
  );
  if (!next.id && next.durum === "yapilmadi" && !next.tamamlandi) {
    return rest;
  }
  return [...rest, next];
}

export const fieldClass =
  "w-full rounded-xl border border-[#e8e0d4] bg-white px-3.5 py-2.5 text-sm text-[#1a1612] placeholder:text-[#6b6158] outline-none focus:border-[#b8934a]/40";

export const chipClass =
  "rounded-lg border border-[#e8e0d4] px-2.5 py-1.5 text-xs text-[#1a1612] hover:bg-[#1a1612]/5 disabled:opacity-40";

export const goldBtn =
  "rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-medium text-[#1a1612] disabled:opacity-50";
