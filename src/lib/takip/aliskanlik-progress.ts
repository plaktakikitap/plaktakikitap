import type {
  Aliskanlik,
  AliskanlikKayit,
  AliskanlikKayitDurum,
  AliskanlikZamanDilimi,
} from "@/types/takip";

export type ZamanSlot =
  | "sabah"
  | "gunduz"
  | "yolculuk"
  | "aksam"
  | "gun_boyu";

export const ZAMAN_SLOT_LABEL: Record<ZamanSlot, string> = {
  sabah: "Sabah",
  gunduz: "Gün içinde",
  yolculuk: "Yolculuk",
  aksam: "Akşam",
  gun_boyu: "Gün boyu",
};

export function zamanSlot(
  z: AliskanlikZamanDilimi | null
): ZamanSlot {
  if (z === "sabah") return "sabah";
  if (z === "yolculuk") return "yolculuk";
  if (z === "aksam" || z === "gece") return "aksam";
  if (z === "gun_boyu") return "gun_boyu";
  return "gunduz";
}

export function altDoneCount(
  habit: Aliskanlik,
  kayit: AliskanlikKayit | undefined,
  grup?: string
): { done: number; total: number } {
  const steps = grup
    ? habit.alt_adimlar.filter((s) => s.grup === grup)
    : habit.alt_adimlar;
  const map = kayit?.alt_adimlar ?? {};
  const done = steps.filter((s) => map[s.kod]).length;
  return { done, total: steps.length };
}

export function deriveDurum(input: {
  habit: Aliskanlik;
  deger?: number | null;
  alt?: Record<string, boolean>;
  explicit?: AliskanlikKayitDurum | null;
}): AliskanlikKayitDurum {
  if (input.explicit) return input.explicit;
  const { habit } = input;
  const alt = input.alt ?? {};

  if (habit.ozel_tur === "namaz") {
    const n = habit.alt_adimlar.filter((s) => alt[s.kod]).length;
    if (n >= 5) return "hedef";
    if (n >= 1) return "minimum";
    return "yapilmadi";
  }

  if (habit.ozel_tur === "ogun") {
    const ana = habit.alt_adimlar.filter((s) => s.grup === "ana_ogun");
    const n = ana.filter((s) => alt[s.kod]).length;
    if (n >= 3) return "hedef";
    if (n >= 2) return "minimum";
    if (n >= 1) return "minimum";
    return "yapilmadi";
  }

  if (habit.ozel_tur === "icerik_hatti") {
    const steps = habit.alt_adimlar;
    const n = steps.filter((s) => alt[s.kod]).length;
    if (alt.paylasim || n >= steps.length) return "hedef";
    if (n >= 1) return "minimum";
    return "yapilmadi";
  }

  if (habit.ozel_tur === "yolculuk" || habit.ozel_tur === "sosyal") {
    const n = Object.values(alt).filter(Boolean).length;
    if (n >= 1) return "minimum";
    return "yapilmadi";
  }

  if (habit.ozel_tur === "uyku") {
    const n = Object.values(alt).filter(Boolean).length;
    if (n >= 3) return "hedef";
    if (n >= 1) return "minimum";
    return "yapilmadi";
  }

  const deger = input.deger;
  if (deger != null && Number.isFinite(deger)) {
    const hedef = habit.hedef_deger;
    const min = habit.minimum_deger;
    if (hedef != null && deger > hedef) return "bonus";
    if (hedef != null && deger >= hedef) return "hedef";
    if (min != null && deger >= min) return "minimum";
    if (deger > 0 && min == null && hedef == null) return "hedef";
  }

  return "yapilmadi";
}

export function nextOpenStep(
  habit: Aliskanlik,
  kayit: AliskanlikKayit | undefined
): string | null {
  const map = kayit?.alt_adimlar ?? {};
  for (const s of habit.alt_adimlar) {
    if (!map[s.kod]) return s.ad;
  }
  return null;
}
