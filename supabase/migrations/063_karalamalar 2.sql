-- SECTION_NAME: karalamalar — kişisel kısa notlar / sözlük tarzı yazılar
CREATE TABLE IF NOT EXISTS karalamalar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  baslik text NOT NULL,
  icerik text NOT NULL,
  slug text UNIQUE NOT NULL,
  yayinda boolean DEFAULT true,
  olusturma_tarihi timestamptz DEFAULT now(),
  guncelleme_tarihi timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_karalamalar_olusturma ON karalamalar (olusturma_tarihi DESC);
CREATE INDEX IF NOT EXISTS idx_karalamalar_yayinda ON karalamalar (yayinda) WHERE yayinda = true;

ALTER TABLE karalamalar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes yayindakileri okuyabilir" ON karalamalar;
CREATE POLICY "Herkes yayindakileri okuyabilir"
  ON karalamalar FOR SELECT
  TO anon
  USING (yayinda = true);

DROP POLICY IF EXISTS "Admin her seyi yapabilir" ON karalamalar;
CREATE POLICY "Admin her seyi yapabilir"
  ON karalamalar FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "karalamalar_service_role_all" ON karalamalar;
CREATE POLICY "karalamalar_service_role_all"
  ON karalamalar FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
