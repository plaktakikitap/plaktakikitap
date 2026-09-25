-- Alışkanlık sistemi: program alanları, gün modu, haftalık değerlendirme.
-- Additive only. Mevcut satırlar silinmez; tamamlandi korunur.

ALTER TABLE aliskanliklar
  ADD COLUMN IF NOT EXISTS kategori text,
  ADD COLUMN IF NOT EXISTS kimlik_ifadesi text,
  ADD COLUMN IF NOT EXISTS program_turu text,
  ADD COLUMN IF NOT EXISTS hedef_gunler smallint[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hedef_siklik integer,
  ADD COLUMN IF NOT EXISTS birim text,
  ADD COLUMN IF NOT EXISTS minimum_deger numeric,
  ADD COLUMN IF NOT EXISTS hedef_deger numeric,
  ADD COLUMN IF NOT EXISTS tetikleyici text,
  ADD COLUMN IF NOT EXISTS zaman_dilimi text,
  ADD COLUMN IF NOT EXISTS siradaki_adim text,
  ADD COLUMN IF NOT EXISTS zorluk_seviyesi smallint,
  ADD COLUMN IF NOT EXISTS sira integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS renk text NOT NULL DEFAULT '#b8934a',
  ADD COLUMN IF NOT EXISTS ikon text,
  ADD COLUMN IF NOT EXISTS ozel_tur text,
  ADD COLUMN IF NOT EXISTS arsivlendi boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS plan_kodu text,
  ADD COLUMN IF NOT EXISTS asama smallint,
  ADD COLUMN IF NOT EXISTS alt_adimlar jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS karsilayan_aliskanlik_id uuid REFERENCES aliskanliklar(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS guncelleme_tarihi timestamptz DEFAULT now();

ALTER TABLE aliskanlik_kayitlari
  ADD COLUMN IF NOT EXISTS durum text,
  ADD COLUMN IF NOT EXISTS deger numeric,
  ADD COLUMN IF NOT EXISTS notlar text,
  ADD COLUMN IF NOT EXISTS gun_modu text,
  ADD COLUMN IF NOT EXISTS kayit_zamani timestamptz,
  ADD COLUMN IF NOT EXISTS alt_adimlar jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ekstra jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE aliskanlik_kayitlari
SET durum = CASE WHEN tamamlandi THEN 'hedef' ELSE 'yapilmadi' END
WHERE durum IS NULL;

ALTER TABLE aliskanlik_kayitlari
  DROP CONSTRAINT IF EXISTS aliskanlik_kayitlari_durum_check;
ALTER TABLE aliskanlik_kayitlari
  ADD CONSTRAINT aliskanlik_kayitlari_durum_check
  CHECK (
    durum IS NULL
    OR durum IN ('minimum', 'hedef', 'bonus', 'yapilmadi', 'planli_degil')
  );

ALTER TABLE aliskanlik_kayitlari
  DROP CONSTRAINT IF EXISTS aliskanlik_kayitlari_gun_modu_check;
ALTER TABLE aliskanlik_kayitlari
  ADD CONSTRAINT aliskanlik_kayitlari_gun_modu_check
  CHECK (
    gun_modu IS NULL
    OR gun_modu IN ('normal', 'yogun', 'toparlanma')
  );

ALTER TABLE aliskanliklar
  DROP CONSTRAINT IF EXISTS aliskanliklar_program_turu_check;
ALTER TABLE aliskanliklar
  ADD CONSTRAINT aliskanliklar_program_turu_check
  CHECK (
    program_turu IS NULL
    OR program_turu IN (
      'gunluk',
      'belirli_gunler',
      'iki_gunde_bir',
      'haftada_x',
      'ayda_x',
      'esnek',
      'haftalik',
      'challenge'
    )
  );

ALTER TABLE aliskanliklar
  DROP CONSTRAINT IF EXISTS aliskanliklar_zaman_dilimi_check;
ALTER TABLE aliskanliklar
  ADD CONSTRAINT aliskanliklar_zaman_dilimi_check
  CHECK (
    zaman_dilimi IS NULL
    OR zaman_dilimi IN (
      'sabah',
      'gunduz',
      'aksam',
      'gun_boyu',
      'yolculuk',
      'ogle',
      'gece'
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_aliskanliklar_plan_kodu
  ON aliskanliklar (plan_kodu)
  WHERE plan_kodu IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_aliskanliklar_aktif_arsiv
  ON aliskanliklar (aktif, arsivlendi);

CREATE TABLE IF NOT EXISTS aliskanlik_gunleri (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tarih date UNIQUE NOT NULL,
  gun_modu text NOT NULL DEFAULT 'normal'
    CHECK (gun_modu IN ('normal', 'yogun', 'toparlanma')),
  notlar text,
  olusturma_tarihi timestamptz DEFAULT now(),
  guncelleme_tarihi timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aliskanlik_haftalik_degerlendirmeler (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hafta_baslangici date UNIQUE NOT NULL,
  dogal_akan text,
  zorlanan text,
  sorun_turu text
    CHECK (
      sorun_turu IS NULL
      OR sorun_turu IN ('zaman', 'ortam', 'tetikleyici', 'zorluk', 'enerji')
    ),
  buyuk_hedef text,
  kucultme text,
  ust_seviye text,
  notlar text,
  olusturma_tarihi timestamptz DEFAULT now(),
  guncelleme_tarihi timestamptz DEFAULT now()
);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'aliskanlik_gunleri',
    'aliskanlik_haftalik_degerlendirmeler'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Sadece admin" ON %I', t);
    EXECUTE format(
      'CREATE POLICY "Sadece admin" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      t
    );
    EXECUTE format('DROP POLICY IF EXISTS "%s_service_role_all" ON %I', t, t);
    EXECUTE format(
      'CREATE POLICY "%s_service_role_all" ON %I FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'')',
      t, t
    );
  END LOOP;
END $$;

COMMENT ON COLUMN aliskanlik_kayitlari.notlar IS 'Günlük kayıt notu';
COMMENT ON COLUMN aliskanliklar.hedef_gunler IS 'ISO weekday 1=Pzt … 7=Paz';
COMMENT ON COLUMN aliskanliklar.plan_kodu IS 'Hazır plan kimliği; idempotent kurulum';
