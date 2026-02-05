-- Yazılarım: Denemeler, Şiirler, Diğer (üç kategorili arşiv)

CREATE TABLE IF NOT EXISTS writings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('denemeler', 'siirler', 'diger')),
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE writings IS 'Yazılarım arşivi: denemeler, şiirler, diğer. body = HTML (Rich Text).';

CREATE INDEX IF NOT EXISTS idx_writings_category ON writings (category);
CREATE INDEX IF NOT EXISTS idx_writings_published ON writings (published_at DESC NULLS LAST);

ALTER TABLE writings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "writings_public_select"
  ON writings FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "writings_admin"
  ON writings FOR ALL USING (auth.role() = 'service_role');
