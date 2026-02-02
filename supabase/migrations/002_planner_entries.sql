-- Planner entries: links planner_entry content to a date
CREATE TABLE IF NOT EXISTS planner_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  UNIQUE(content_id)
);

-- RLS
ALTER TABLE planner_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planner_entries_public_read"
  ON planner_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content_items ci
      WHERE ci.id = content_id
      AND ci.type = 'planner_entry'
      AND ci.visibility IN ('public', 'unlisted')
    )
  );

CREATE POLICY "planner_entries_admin_all"
  ON planner_entries FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
