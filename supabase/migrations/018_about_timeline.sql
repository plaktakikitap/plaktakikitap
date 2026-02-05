-- Beni Tanıyın — Narrative Timeline with Polaroid Memories
CREATE TABLE IF NOT EXISTS about_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_or_period TEXT NOT NULL,
  paragraph_text TEXT NOT NULL DEFAULT '',
  associated_images JSONB DEFAULT '[]',
  order_index INT NOT NULL DEFAULT 0,
  is_highlight BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- associated_images: [{ "url": "...", "caption": "..." }, ...]
COMMENT ON COLUMN about_timeline.associated_images IS 'Polaroid görselleri: [{ url, caption }]';
COMMENT ON COLUMN about_timeline.is_highlight IS 'Vurgulu gösterim — timeline üzerinde büyük/farklı renk';

CREATE INDEX idx_about_timeline_order ON about_timeline (order_index);

ALTER TABLE about_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "about_timeline_select" ON about_timeline FOR SELECT USING (true);
CREATE POLICY "about_timeline_insert" ON about_timeline FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'authenticated');
CREATE POLICY "about_timeline_update" ON about_timeline FOR UPDATE
  USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'authenticated');
CREATE POLICY "about_timeline_delete" ON about_timeline FOR DELETE
  USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'authenticated');
