-- Kişisel takip araçları: beslenme, spor, günlük, şükür, finans, alışkanlıklar

CREATE TABLE IF NOT EXISTS beslenme_gunlugu (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tarih date NOT NULL,
  ogun text NOT NULL CHECK (ogun IN ('sabah', 'ogle', 'aksam', 'ara_ogun')),
  yenen text NOT NULL,
  ai_analiz jsonb,
  olusturma_tarihi timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_beslenme_tarih ON beslenme_gunlugu (tarih DESC);

CREATE TABLE IF NOT EXISTS spor_gunlugu (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tarih date NOT NULL,
  aktivite text NOT NULL,
  sure_dakika integer,
  mesafe_km numeric,
  enerji_seviyesi integer CHECK (enerji_seviyesi BETWEEN 1 AND 5),
  notlar text,
  olusturma_tarihi timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_spor_tarih ON spor_gunlugu (tarih DESC);

CREATE TABLE IF NOT EXISTS gunluk (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tarih date UNIQUE NOT NULL,
  icerik text NOT NULL,
  ruh_hali text CHECK (ruh_hali IS NULL OR ruh_hali IN ('iyi', 'orta', 'zor')),
  olusturma_tarihi timestamptz DEFAULT now(),
  guncelleme_tarihi timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sukur_gunlugu (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tarih date UNIQUE NOT NULL,
  madde_1 text NOT NULL,
  madde_2 text NOT NULL,
  madde_3 text NOT NULL,
  olusturma_tarihi timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finans_kategoriler (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ad text NOT NULL,
  tur text NOT NULL CHECK (tur IN ('gelir', 'gider')),
  renk text DEFAULT '#c9a65a'
);

CREATE TABLE IF NOT EXISTS finans_kayitlari (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tarih date NOT NULL,
  tur text NOT NULL CHECK (tur IN ('gelir', 'gider')),
  tutar numeric NOT NULL,
  kategori text NOT NULL,
  notlar text,
  olusturma_tarihi timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_finans_tarih ON finans_kayitlari (tarih DESC);

CREATE TABLE IF NOT EXISTS aliskanliklar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ad text NOT NULL,
  aciklama text,
  aktif boolean DEFAULT true,
  olusturma_tarihi timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aliskanlik_kayitlari (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  aliskanlik_id uuid REFERENCES aliskanliklar(id) ON DELETE CASCADE,
  tarih date NOT NULL,
  tamamlandi boolean DEFAULT false,
  UNIQUE(aliskanlik_id, tarih)
);
CREATE INDEX IF NOT EXISTS idx_aliskanlik_kayit_tarih ON aliskanlik_kayitlari (tarih DESC);

-- RLS
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'beslenme_gunlugu', 'spor_gunlugu', 'gunluk', 'sukur_gunlugu',
    'finans_kayitlari', 'finans_kategoriler', 'aliskanliklar', 'aliskanlik_kayitlari'
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

CREATE OR REPLACE FUNCTION set_gunluk_guncelleme_tarihi()
RETURNS TRIGGER AS $$
BEGIN
  NEW.guncelleme_tarihi = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS gunluk_guncelleme_tarihi ON gunluk;
CREATE TRIGGER gunluk_guncelleme_tarihi
  BEFORE UPDATE ON gunluk
  FOR EACH ROW EXECUTE FUNCTION set_gunluk_guncelleme_tarihi();

-- Varsayılan finans kategorileri (boşsa)
INSERT INTO finans_kategoriler (ad, tur, renk)
SELECT * FROM (VALUES
  ('Market', 'gider', '#b85c38'),
  ('Fatura', 'gider', '#6b2c2c'),
  ('Kıyafet', 'gider', '#4a3a2c'),
  ('Kitap', 'gider', '#2c4a3e'),
  ('Eğlence', 'gider', '#4a2c4a'),
  ('Yemek', 'gider', '#6b4a2c'),
  ('Ulaşım', 'gider', '#2c3a4a'),
  ('Sağlık', 'gider', '#2c6b4a'),
  ('Diğer Gider', 'gider', '#4a4a4a'),
  ('Maaş', 'gelir', '#2c6b2c'),
  ('Serbest İş', 'gelir', '#4a6b2c'),
  ('Diğer Gelir', 'gelir', '#6b6b2c')
) AS v(ad, tur, renk)
WHERE NOT EXISTS (SELECT 1 FROM finans_kategoriler LIMIT 1);
