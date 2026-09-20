-- Ziyaretçi mesajları (Beni Tanıyın sayfası)
CREATE TABLE IF NOT EXISTS mesajlar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isim TEXT NOT NULL,
  mesaj TEXT NOT NULL,
  tarih TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mesajlar_tarih ON mesajlar (tarih DESC);

CREATE POLICY "mesajlar_anon_insert"
  ON mesajlar FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "mesajlar_authenticated_select"
  ON mesajlar FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "mesajlar_service_role_all"
  ON mesajlar FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
