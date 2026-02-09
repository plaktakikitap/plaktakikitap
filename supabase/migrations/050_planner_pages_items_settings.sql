-- A) planner_pages — her ay için bir spread sayfası
CREATE TABLE IF NOT EXISTS planner_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(year, month)
);

CREATE INDEX idx_planner_pages_year_month ON planner_pages (year, month);

ALTER TABLE planner_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planner_pages_select" ON planner_pages FOR SELECT USING (true);
CREATE POLICY "planner_pages_insert" ON planner_pages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_pages_update" ON planner_pages FOR UPDATE
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_pages_delete" ON planner_pages FOR DELETE
  USING (auth.role() = 'authenticated');

-- B) planner_items — sayfa üzerinde overlay öğeleri (x,y normalize 0..100; rotation, scale, z_index)
CREATE TABLE IF NOT EXISTS planner_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES planner_pages(id) ON DELETE CASCADE,
  page_side TEXT NOT NULL CHECK (page_side IN ('left', 'right')) DEFAULT 'right',
  type TEXT NOT NULL CHECK (type IN (
    'photo', 'polaroid', 'sticker', 'postit', 'tape', 'paperclip',
    'text', 'doodle', 'coffee_stain'
  )),
  asset_url TEXT,
  text_content TEXT,
  x FLOAT NOT NULL DEFAULT 50,
  y FLOAT NOT NULL DEFAULT 50,
  rotation FLOAT NOT NULL DEFAULT 0,
  scale FLOAT NOT NULL DEFAULT 1,
  z_index INT NOT NULL DEFAULT 1,
  style_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_planner_items_page_id ON planner_items (page_id);

ALTER TABLE planner_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planner_items_select" ON planner_items FOR SELECT USING (true);
CREATE POLICY "planner_items_insert" ON planner_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_items_update" ON planner_items FOR UPDATE
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_items_delete" ON planner_items FOR DELETE
  USING (auth.role() = 'authenticated');

-- C) planner_settings — tek satır ayarlar
CREATE TABLE IF NOT EXISTS planner_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL DEFAULT 2026,
  cover_title TEXT DEFAULT 'AJANDA',
  cover_subtitle TEXT DEFAULT '2026',
  page_width INT NOT NULL DEFAULT 550,
  page_height INT NOT NULL DEFAULT 750,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE planner_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planner_settings_select" ON planner_settings FOR SELECT USING (true);
CREATE POLICY "planner_settings_insert" ON planner_settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_settings_update" ON planner_settings FOR UPDATE
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_settings_delete" ON planner_settings FOR DELETE
  USING (auth.role() = 'authenticated');

-- Seed default settings row (only if empty)
INSERT INTO planner_settings (year, cover_title, cover_subtitle, page_width, page_height)
SELECT 2026, 'AJANDA', '2026', 550, 750
WHERE NOT EXISTS (SELECT 1 FROM planner_settings LIMIT 1);

-- planner-assets bucket for photo/sticker uploads
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'planner-assets',
      'planner-assets',
      true,
      5242880,
      ARRAY['image/jpeg','image/png','image/webp','image/gif']::text[]
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
