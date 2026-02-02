-- Translations detail (book jackets, external links)
CREATE TABLE IF NOT EXISTS translations (
  content_id UUID PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
  author TEXT,
  original_title TEXT,
  cover_url TEXT,
  external_url TEXT,
  link_label TEXT CHECK (link_label IN ('buy', 'review'))
);

ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "translations_public_read"
  ON translations FOR SELECT USING (true);

CREATE POLICY "translations_admin_all"
  ON translations FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
