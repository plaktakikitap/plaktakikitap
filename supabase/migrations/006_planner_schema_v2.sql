-- Planner schema v2: planner_day -> planner_entry -> planner_media
-- Replaces previous planner_entries / planner_media

DROP TABLE IF EXISTS planner_media CASCADE;
DROP TABLE IF EXISTS planner_entries CASCADE;

-- 4.1 planner_day
CREATE TABLE planner_day (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  year INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.2 planner_entry
CREATE TABLE planner_entry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES planner_day(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  mood TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_planner_entry_day_created
  ON planner_entry (day_id, created_at DESC);

-- 4.3 planner_media
CREATE TABLE planner_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES planner_entry(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  thumb_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6) RLS — public read, authenticated write
ALTER TABLE planner_day ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_media ENABLE ROW LEVEL SECURITY;

-- planner_day
CREATE POLICY "planner_day_select"
  ON planner_day FOR SELECT
  USING (true);

CREATE POLICY "planner_day_insert"
  ON planner_day FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "planner_day_update"
  ON planner_day FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "planner_day_delete"
  ON planner_day FOR DELETE
  USING (auth.role() = 'authenticated');

-- planner_entry
CREATE POLICY "planner_entry_select"
  ON planner_entry FOR SELECT
  USING (true);

CREATE POLICY "planner_entry_insert"
  ON planner_entry FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "planner_entry_update"
  ON planner_entry FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "planner_entry_delete"
  ON planner_entry FOR DELETE
  USING (auth.role() = 'authenticated');

-- planner_media
CREATE POLICY "planner_media_select"
  ON planner_media FOR SELECT
  USING (true);

CREATE POLICY "planner_media_insert"
  ON planner_media FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "planner_media_update"
  ON planner_media FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "planner_media_delete"
  ON planner_media FOR DELETE
  USING (auth.role() = 'authenticated');

-- 5) Storage bucket: planner-media (private, signed URL ile erişim)
-- Dashboard: Storage > New bucket > planner-media, Public: kapalı
-- Veya SQL Editor'da:
--   INSERT INTO storage.buckets (id, name, public)
--   VALUES ('planner-media', 'planner-media', false)
--   ON CONFLICT (id) DO NOTHING;
