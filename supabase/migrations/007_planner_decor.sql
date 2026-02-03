-- planner_decor: sticker, tape, paperclip, pin decorations per page/month
CREATE TABLE IF NOT EXISTS planner_decor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  page TEXT NOT NULL CHECK (page IN ('left', 'right')),
  type TEXT NOT NULL CHECK (type IN ('sticker', 'tape', 'paperclip', 'pin')),
  asset_url TEXT,
  x FLOAT NOT NULL CHECK (x >= 0 AND x <= 1),
  y FLOAT NOT NULL CHECK (y >= 0 AND y <= 1),
  rotation FLOAT NOT NULL DEFAULT 0,
  scale FLOAT NOT NULL DEFAULT 1 CHECK (scale > 0 AND scale <= 3),
  z INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_planner_decor_year_month ON planner_decor (year, month);

ALTER TABLE planner_decor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planner_decor_select" ON planner_decor FOR SELECT USING (true);
CREATE POLICY "planner_decor_insert" ON planner_decor FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_decor_update" ON planner_decor FOR UPDATE
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_decor_delete" ON planner_decor FOR DELETE
  USING (auth.role() = 'authenticated');
