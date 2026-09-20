-- İçerik üretim takip: hesaplar, içerikler, hatırlatıcılar

CREATE TABLE IF NOT EXISTS ic_hesaplar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ad text NOT NULL,
  renk text NOT NULL,
  platformlar text[] NOT NULL DEFAULT '{}',
  aktif boolean DEFAULT true,
  sira integer DEFAULT 0,
  hedef_iki_gunde_bir boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS ic_icerikler (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hesap_id uuid REFERENCES ic_hesaplar(id) ON DELETE CASCADE,
  tur text NOT NULL CHECK (tur IN ('post', 'story', 'video', 'reel')),
  platform text NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube')),
  baslik text NOT NULL,
  aciklama text,
  durum text DEFAULT 'fikir' CHECK (durum IN ('fikir', 'yazildi', 'hazir', 'paylasildi')),
  planlanan_tarih date,
  paylasim_tarihi date,
  notlar text,
  olusturma_tarihi timestamptz DEFAULT now(),
  guncelleme_tarihi timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ic_icerikler_hesap ON ic_icerikler (hesap_id);
CREATE INDEX IF NOT EXISTS idx_ic_icerikler_durum ON ic_icerikler (durum);
CREATE INDEX IF NOT EXISTS idx_ic_icerikler_planlanan ON ic_icerikler (planlanan_tarih);
CREATE INDEX IF NOT EXISTS idx_ic_icerikler_paylasim ON ic_icerikler (paylasim_tarihi);

CREATE TABLE IF NOT EXISTS ic_hatirlaticilar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  icerik_id uuid REFERENCES ic_icerikler(id) ON DELETE CASCADE,
  hatirlatma_zamani timestamptz NOT NULL,
  gonderildi boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_ic_hatirlaticilar_zaman ON ic_hatirlaticilar (hatirlatma_zamani)
  WHERE gonderildi = false;

ALTER TABLE ic_hesaplar ENABLE ROW LEVEL SECURITY;
ALTER TABLE ic_icerikler ENABLE ROW LEVEL SECURITY;
ALTER TABLE ic_hatirlaticilar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sadece admin" ON ic_hesaplar;
CREATE POLICY "Sadece admin" ON ic_hesaplar
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Sadece admin" ON ic_icerikler;
CREATE POLICY "Sadece admin" ON ic_icerikler
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Sadece admin" ON ic_hatirlaticilar;
CREATE POLICY "Sadece admin" ON ic_hatirlaticilar
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ic_hesaplar_service_role_all" ON ic_hesaplar;
CREATE POLICY "ic_hesaplar_service_role_all" ON ic_hesaplar
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "ic_icerikler_service_role_all" ON ic_icerikler;
CREATE POLICY "ic_icerikler_service_role_all" ON ic_icerikler
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "ic_hatirlaticilar_service_role_all" ON ic_hatirlaticilar;
CREATE POLICY "ic_hatirlaticilar_service_role_all" ON ic_hatirlaticilar
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION set_ic_icerikler_guncelleme()
RETURNS TRIGGER AS $$
BEGIN
  NEW.guncelleme_tarihi = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ic_icerikler_guncelleme ON ic_icerikler;
CREATE TRIGGER ic_icerikler_guncelleme
  BEFORE UPDATE ON ic_icerikler
  FOR EACH ROW EXECUTE FUNCTION set_ic_icerikler_guncelleme();

INSERT INTO ic_hesaplar (ad, renk, platformlar, sira)
SELECT * FROM (VALUES
  ('PlaktakiKitap', '#c9a65a', ARRAY['instagram', 'youtube']::text[], 1),
  ('Camii', '#6b8f71', ARRAY['instagram']::text[], 2),
  ('Kafe', '#8f6b4a', ARRAY['instagram', 'tiktok']::text[], 3),
  ('Kitabevi', '#4a6b8f', ARRAY['instagram']::text[], 4),
  ('Alakart', '#8f4a6b', ARRAY['instagram', 'tiktok']::text[], 5),
  ('Tourmania', '#6b4a8f', ARRAY['instagram', 'youtube', 'tiktok']::text[], 6)
) AS v(ad, renk, platformlar, sira)
WHERE NOT EXISTS (SELECT 1 FROM ic_hesaplar LIMIT 1);
