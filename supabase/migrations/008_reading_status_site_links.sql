-- reading_status: "Şu an okuyorum" / "En son okuduğum"
CREATE TABLE IF NOT EXISTS reading_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'reading' CHECK (status IN ('reading', 'last')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sadece bir kayıt: reading veya last (tek satır güncellenir)
-- İlk kayıt eklenir, sonra güncellenir
ALTER TABLE reading_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_reading_status"
  ON reading_status FOR SELECT
  USING (true);

CREATE POLICY "admin_all_reading_status"
  ON reading_status FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- site_links: Footer linkleri (Instagram, X, Mail, vb.)
CREATE TABLE IF NOT EXISTS site_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE site_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_active_site_links"
  ON site_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "admin_all_site_links"
  ON site_links FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
