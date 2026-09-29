import { z } from "zod";

export const programTuruSchema = z.enum([
  "gunluk",
  "belirli_gunler",
  "iki_gunde_bir",
  "haftada_x",
  "ayda_x",
  "esnek",
  "haftalik",
  "challenge",
]);

export const zamanDilimiSchema = z.enum([
  "sabah",
  "gunduz",
  "aksam",
  "gun_boyu",
  "yolculuk",
  "ogle",
  "gece",
]);

export const kayitDurumSchema = z.enum([
  "minimum",
  "hedef",
  "bonus",
  "yapilmadi",
  "planli_degil",
]);

export const gunModuSchema = z.enum(["normal", "yogun", "toparlanma"]);

export const ozelTurSchema = z.enum([
  "namaz",
  "ogun",
  "dil",
  "yolculuk",
  "icerik_hatti",
  "sosyal",
  "uyku",
]);

export const sorunTuruSchema = z.enum([
  "zaman",
  "ortam",
  "tetikleyici",
  "zorluk",
  "enerji",
]);

export const baglamSchema = z.enum(["ev", "is", "yol", "dusuk_enerji"]);

export const durtuSebepSchema = z.enum([
  "is",
  "paylasim",
  "mesaj",
  "merak",
  "can_sikintisi",
]);

export const durtuDurumSchema = z.enum([
  "bekliyor",
  "amac_tamamlandi",
  "istek_gecti",
  "hala_istiyorum",
  "alternatif_yapildi",
]);

export const oneriEylemSchema = z.enum(["yapildi", "baska", "uygun_degil"]);

const altAdimSchema = z.object({
  kod: z.string().min(1),
  ad: z.string().min(1),
  grup: z.string().optional(),
});

const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v && v.length ? v : null));

const optionalNum = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  });

export const habitWriteSchema = z.object({
  ad: z.string().trim().min(1, "Alışkanlık adı gerekli."),
  aciklama: optionalText,
  kategori: optionalText,
  kimlik_ifadesi: optionalText,
  program_turu: programTuruSchema.optional().nullable(),
  hedef_gunler: z.array(z.number().int().min(1).max(7)).optional(),
  hedef_siklik: optionalNum,
  birim: optionalText,
  minimum_deger: optionalNum,
  hedef_deger: optionalNum,
  tetikleyici: optionalText,
  zaman_dilimi: zamanDilimiSchema.optional().nullable(),
  siradaki_adim: optionalText,
  zorluk_seviyesi: optionalNum,
  sira: optionalNum,
  renk: optionalText,
  ikon: optionalText,
  ozel_tur: ozelTurSchema.optional().nullable(),
  alt_adimlar: z.array(altAdimSchema).optional(),
  karsilayan_aliskanlik_id: z.string().uuid().optional().nullable(),
  asama: optionalNum,
  baglamlar: z.array(baglamSchema).optional(),
  muhtemel_engel: optionalText,
  eger_kosulu: optionalText,
  o_zaman_davranis: optionalText,
});

export const kayitWriteSchema = z.object({
  aliskanlik_id: z.string().uuid(),
  tarih: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tamamlandi: z.boolean().optional(),
  durum: kayitDurumSchema.optional().nullable(),
  deger: optionalNum,
  notlar: optionalText,
  gun_modu: gunModuSchema.optional().nullable(),
  alt_adim_kod: z.string().optional(),
  alt_adim_deger: z.boolean().optional(),
  alt_adimlar: z.record(z.string(), z.boolean()).optional(),
  ekstra: z.record(z.string(), z.unknown()).optional(),
  geri_al: z.boolean().optional(),
});

export const gunWriteSchema = z.object({
  tarih: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gun_modu: gunModuSchema.optional(),
  notlar: optionalText,
  baglam: baglamSchema.optional().nullable(),
  atlanan_oneriler: z.array(z.string().uuid()).optional(),
  uygun_degil: z.array(z.string().uuid()).optional(),
});

export const aksamWriteSchema = z.object({
  tarih: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adim_kod: z.string().optional(),
  adim_deger: z.boolean().optional(),
  ilk_davranis: optionalText,
  adimlar_sablon: z
    .array(z.object({ kod: z.string().min(1), ad: z.string().min(1) }))
    .optional(),
});

export const cevreWriteSchema = z.object({
  id: z.string().uuid(),
  desteklenen_davranis: optionalText,
  gorunur_isaret: optionalText,
  kaldirilacak_engel: optionalText,
  surtunme: optionalText,
  haftanin_degisikligi: optionalText,
  bu_hafta_aktif: z.boolean().optional(),
  tamamlandi: z.boolean().optional(),
});

export const durtuCreateSchema = z.object({
  sebep: durtuSebepSchema,
  amac: optionalText,
  alternatif: optionalText,
});

export const durtuUpdateSchema = z.object({
  id: z.string().uuid(),
  durum: durtuDurumSchema.optional(),
  amac: optionalText,
  alternatif: optionalText,
});

export const reviewWriteSchema = z.object({
  hafta_baslangici: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dogal_akan: optionalText,
  zorlanan: optionalText,
  sorun_turu: sorunTuruSchema.optional().nullable(),
  buyuk_hedef: optionalText,
  kucultme: optionalText,
  ust_seviye: optionalText,
  notlar: optionalText,
});
