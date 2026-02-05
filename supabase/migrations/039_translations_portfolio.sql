-- Portfolio-grade translations: settings, books, independent items, volunteer projects

-- A) translations_settings (single row for intro)
CREATE TABLE IF NOT EXISTS translations_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intro_title TEXT NOT NULL DEFAULT 'Çevirilerim',
  intro_body TEXT NOT NULL,
  intro_signature TEXT,
  academia_profile_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE translations_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "translations_settings_select" ON translations_settings FOR SELECT USING (true);
CREATE POLICY "translations_settings_admin" ON translations_settings FOR ALL
  USING (auth.role() = 'service_role' OR (auth.jwt() ->> 'role') = 'authenticated')
  WITH CHECK (auth.role() = 'service_role' OR (auth.jwt() ->> 'role') = 'authenticated');

-- Seed single row if empty
INSERT INTO translations_settings (id, intro_title, intro_body)
SELECT gen_random_uuid(), 'Çevirilerim', 'Çeviri metni buraya.'
WHERE NOT EXISTS (SELECT 1 FROM translations_settings LIMIT 1);

-- B) translation_books (published books)
CREATE TABLE IF NOT EXISTS translation_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  original_author TEXT NOT NULL,
  publisher TEXT NOT NULL,
  year INT,
  cover_url TEXT NOT NULL,
  amazon_url TEXT,
  source_lang TEXT,
  target_lang TEXT,
  is_released BOOLEAN NOT NULL DEFAULT true,
  completion_percentage INT NOT NULL DEFAULT 100,
  translator_note TEXT,
  status_badge TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE translation_books ADD CONSTRAINT chk_completion
  CHECK (completion_percentage >= 0 AND completion_percentage <= 100);

CREATE INDEX idx_translation_books_order ON translation_books (is_released DESC, order_index ASC, created_at DESC);
ALTER TABLE translation_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "translation_books_select" ON translation_books FOR SELECT USING (true);
CREATE POLICY "translation_books_admin" ON translation_books FOR ALL
  USING (auth.role() = 'service_role' OR (auth.jwt() ->> 'role') = 'authenticated')
  WITH CHECK (auth.role() = 'service_role' OR (auth.jwt() ->> 'role') = 'authenticated');

-- C) translation_independent (self-initiated / academia-style)
CREATE TABLE IF NOT EXISTS translation_independent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  year INT,
  tags TEXT[],
  file_url TEXT,
  external_url TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_translation_independent_order ON translation_independent (order_index ASC);
ALTER TABLE translation_independent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "translation_independent_select" ON translation_independent FOR SELECT USING (true);
CREATE POLICY "translation_independent_admin" ON translation_independent FOR ALL
  USING (auth.role() = 'service_role' OR (auth.jwt() ->> 'role') = 'authenticated')
  WITH CHECK (auth.role() = 'service_role' OR (auth.jwt() ->> 'role') = 'authenticated');

-- D) translation_volunteer_projects
CREATE TABLE IF NOT EXISTS translation_volunteer_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name TEXT NOT NULL,
  role_title TEXT,
  description TEXT,
  website_url TEXT,
  instagram_url TEXT,
  x_url TEXT,
  years TEXT,
  highlights TEXT[],
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_translation_volunteer_order ON translation_volunteer_projects (order_index ASC);
ALTER TABLE translation_volunteer_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "translation_volunteer_select" ON translation_volunteer_projects FOR SELECT USING (true);
CREATE POLICY "translation_volunteer_admin" ON translation_volunteer_projects FOR ALL
  USING (auth.role() = 'service_role' OR (auth.jwt() ->> 'role') = 'authenticated')
  WITH CHECK (auth.role() = 'service_role' OR (auth.jwt() ->> 'role') = 'authenticated');

COMMENT ON TABLE translations_settings IS 'Çeviriler sayfası giriş metni (tek satır)';
COMMENT ON TABLE translation_books IS 'Yayınlanmış çeviri kitapları';
COMMENT ON TABLE translation_independent IS 'Bağımsız / akademik çeviriler';
COMMENT ON TABLE translation_volunteer_projects IS 'Gönüllü projeler (Felsefelog, Bilimolog vb.)';
