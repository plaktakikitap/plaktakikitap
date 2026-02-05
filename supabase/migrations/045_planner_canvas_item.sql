-- Canvas items: per-page (left/right) positions and rotation for messy layout
CREATE TABLE IF NOT EXISTS planner_canvas_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  page TEXT NOT NULL CHECK (page IN ('left', 'right')),
  item_kind TEXT NOT NULL CHECK (item_kind IN (
    'attached_photo', 'polaroid', 'note', 'custom_field', 'paperclip', 'washi'
  )),
  item_key TEXT NOT NULL,
  x FLOAT NOT NULL CHECK (x >= 0 AND x <= 1),
  y FLOAT NOT NULL CHECK (y >= 0 AND y <= 1),
  rotation FLOAT NOT NULL DEFAULT 0,
  z_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(year, month, page, item_kind, item_key)
);

CREATE INDEX idx_planner_canvas_item_year_month ON planner_canvas_item (year, month);

ALTER TABLE planner_canvas_item ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planner_canvas_item_select" ON planner_canvas_item FOR SELECT USING (true);
CREATE POLICY "planner_canvas_item_insert" ON planner_canvas_item FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_canvas_item_update" ON planner_canvas_item FOR UPDATE
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_canvas_item_delete" ON planner_canvas_item FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION set_planner_canvas_item_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER planner_canvas_item_updated_at
  BEFORE UPDATE ON planner_canvas_item
  FOR EACH ROW EXECUTE FUNCTION set_planner_canvas_item_updated_at();
