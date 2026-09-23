-- Dil öğrenme: kelime bankası + notlar

CREATE TABLE IF NOT EXISTS dil_kelimeler (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dil text NOT NULL CHECK (dil IN ('ingilizce', 'fransizca', 'almanca', 'arapca')),
  kelime text NOT NULL,
  anlam text NOT NULL,
  ornek_cumle text,
  telaffuz text,
  arapca_yazi text,
  zorluk text DEFAULT 'orta' CHECK (zorluk IN ('kolay', 'orta', 'zor')),
  ogrenildi boolean DEFAULT false,
  tekrar_sayisi integer DEFAULT 0,
  son_tekrar timestamptz,
  etiket text[] DEFAULT '{}',
  olusturma_tarihi timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dil_notlar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dil text NOT NULL CHECK (dil IN ('ingilizce', 'fransizca', 'almanca', 'arapca')),
  baslik text NOT NULL,
  icerik text NOT NULL,
  kategori text CHECK (kategori IS NULL OR kategori IN ('gramer', 'telaffuz', 'deyim', 'genel')),
  olusturma_tarihi timestamptz DEFAULT now(),
  guncelleme_tarihi timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dil_kelimeler_dil ON dil_kelimeler(dil);
CREATE INDEX IF NOT EXISTS idx_dil_kelimeler_ogrenildi ON dil_kelimeler(dil, ogrenildi);
CREATE INDEX IF NOT EXISTS idx_dil_notlar_dil ON dil_notlar(dil);

ALTER TABLE dil_kelimeler ENABLE ROW LEVEL SECURITY;
ALTER TABLE dil_notlar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sadece admin" ON dil_kelimeler;
CREATE POLICY "Sadece admin" ON dil_kelimeler
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Sadece admin" ON dil_notlar;
CREATE POLICY "Sadece admin" ON dil_notlar
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "dil_kelimeler_service_role_all" ON dil_kelimeler;
CREATE POLICY "dil_kelimeler_service_role_all" ON dil_kelimeler
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "dil_notlar_service_role_all" ON dil_notlar;
CREATE POLICY "dil_notlar_service_role_all" ON dil_notlar
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION set_dil_notlar_guncelleme()
RETURNS TRIGGER AS $$
BEGIN
  NEW.guncelleme_tarihi = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dil_notlar_guncelleme ON dil_notlar;
CREATE TRIGGER dil_notlar_guncelleme
  BEFORE UPDATE ON dil_notlar
  FOR EACH ROW EXECUTE FUNCTION set_dil_notlar_guncelleme();
