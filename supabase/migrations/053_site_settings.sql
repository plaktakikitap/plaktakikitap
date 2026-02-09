-- Site genel ayarları: tek satır (singleton), JSONB ile esnek anahtar-değer
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE site_settings IS 'Tek satır: SEO, global değişkenler, bakım modu, intro metinleri vb.';

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_public_select"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY "site_settings_admin_all"
  ON site_settings FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Tek satır seed (uygulama tek satır kullanır)
INSERT INTO site_settings (id, value)
SELECT gen_random_uuid(), '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);
