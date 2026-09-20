-- Kişisel admin araçları: notlar, yapılacaklar, dosyalar (ziyaretçiye kapalı)

CREATE TABLE IF NOT EXISTS notlar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  baslik text NOT NULL,
  icerik text,
  renk text DEFAULT 'sari' CHECK (renk IN ('sari', 'mavi', 'yesil', 'kirmizi', 'mor')),
  etiket text[] DEFAULT '{}',
  tarih date,
  olusturma_tarihi timestamptz DEFAULT now(),
  guncelleme_tarihi timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notlar_tarih ON notlar (tarih);
CREATE INDEX IF NOT EXISTS idx_notlar_olusturma ON notlar (olusturma_tarihi DESC);

CREATE TABLE IF NOT EXISTS yapilacaklar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  baslik text NOT NULL,
  tamamlandi boolean DEFAULT false,
  oncelik text DEFAULT 'normal' CHECK (oncelik IN ('acil', 'normal', 'bekleyebilir')),
  bitis_tarihi date,
  kategori text,
  olusturma_tarihi timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_yapilacaklar_oncelik ON yapilacaklar (oncelik);
CREATE INDEX IF NOT EXISTS idx_yapilacaklar_bitis ON yapilacaklar (bitis_tarihi);
CREATE INDEX IF NOT EXISTS idx_yapilacaklar_tamamlandi ON yapilacaklar (tamamlandi);

CREATE TABLE IF NOT EXISTS kisisel_dosyalar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dosya_adi text NOT NULL,
  depolama_yolu text NOT NULL,
  dosya_turu text,
  boyut integer,
  klasor text DEFAULT 'genel',
  olusturma_tarihi timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kisisel_dosyalar_klasor ON kisisel_dosyalar (klasor);
CREATE INDEX IF NOT EXISTS idx_kisisel_dosyalar_olusturma ON kisisel_dosyalar (olusturma_tarihi DESC);

-- RLS: anon yok; authenticated + service_role
ALTER TABLE notlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE yapilacaklar ENABLE ROW LEVEL SECURITY;
ALTER TABLE kisisel_dosyalar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sadece admin" ON notlar;
CREATE POLICY "Sadece admin" ON notlar
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Sadece admin" ON yapilacaklar;
CREATE POLICY "Sadece admin" ON yapilacaklar
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Sadece admin" ON kisisel_dosyalar;
CREATE POLICY "Sadece admin" ON kisisel_dosyalar
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "notlar_service_role_all" ON notlar;
CREATE POLICY "notlar_service_role_all" ON notlar
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "yapilacaklar_service_role_all" ON yapilacaklar;
CREATE POLICY "yapilacaklar_service_role_all" ON yapilacaklar
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "kisisel_dosyalar_service_role_all" ON kisisel_dosyalar;
CREATE POLICY "kisisel_dosyalar_service_role_all" ON kisisel_dosyalar
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION set_notlar_guncelleme_tarihi()
RETURNS TRIGGER AS $$
BEGIN
  NEW.guncelleme_tarihi = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notlar_guncelleme_tarihi ON notlar;
CREATE TRIGGER notlar_guncelleme_tarihi
  BEFORE UPDATE ON notlar
  FOR EACH ROW EXECUTE FUNCTION set_notlar_guncelleme_tarihi();

-- Private storage bucket
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'kisisel-dosyalar',
      'kisisel-dosyalar',
      false,
      52428800,
      NULL
    )
    ON CONFLICT (id) DO UPDATE SET public = false;
  END IF;
END $$;
