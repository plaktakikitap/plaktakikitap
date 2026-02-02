-- Planner: standalone date-based model (no content_items)
-- Drop old planner_entries if it referenced content_items
DROP TABLE IF EXISTS planner_entries CASCADE;

CREATE TABLE planner_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  title TEXT,
  body TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'unlisted', 'private')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE planner_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_entry_id UUID NOT NULL REFERENCES planner_entries(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('image', 'video', 'link')),
  url TEXT NOT NULL,
  caption TEXT
);

CREATE TRIGGER planner_entries_updated_at
  BEFORE UPDATE ON planner_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE planner_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_media ENABLE ROW LEVEL SECURITY;

-- Public: read entries where visibility in ('public', 'unlisted')
CREATE POLICY "planner_entries_public_read"
  ON planner_entries FOR SELECT
  USING (visibility IN ('public', 'unlisted'));

CREATE POLICY "planner_entries_admin_all"
  ON planner_entries FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- planner_media: readable when parent entry is readable
CREATE POLICY "planner_media_public_read"
  ON planner_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM planner_entries pe
      WHERE pe.id = planner_entry_id
      AND pe.visibility IN ('public', 'unlisted')
    )
  );

CREATE POLICY "planner_media_admin_all"
  ON planner_media FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
