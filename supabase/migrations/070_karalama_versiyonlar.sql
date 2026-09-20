-- Karalama düzenleme geçmişi
CREATE TABLE IF NOT EXISTS karalama_versiyonlar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  karalama_id uuid REFERENCES karalamalar(id) ON DELETE CASCADE,
  baslik text NOT NULL,
  icerik text NOT NULL,
  degistiren_alan text,
  versiyon_no integer NOT NULL,
  olusturma_tarihi timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_karalama_versiyonlar_karalama
  ON karalama_versiyonlar (karalama_id, versiyon_no DESC);

ALTER TABLE karalama_versiyonlar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sadece admin" ON karalama_versiyonlar;
CREATE POLICY "Sadece admin" ON karalama_versiyonlar
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "karalama_versiyonlar_service_role_all" ON karalama_versiyonlar;
CREATE POLICY "karalama_versiyonlar_service_role_all" ON karalama_versiyonlar
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
