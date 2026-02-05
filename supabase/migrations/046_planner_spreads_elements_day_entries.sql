-- A) planner_spreads: her ay için bir spread (sol + sağ sayfa)
CREATE TABLE IF NOT EXISTS planner_spreads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(year, month)
);

CREATE INDEX idx_planner_spreads_year_month ON planner_spreads (year, month);

ALTER TABLE planner_spreads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planner_spreads_select" ON planner_spreads FOR SELECT USING (true);
CREATE POLICY "planner_spreads_insert" ON planner_spreads FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_spreads_update" ON planner_spreads FOR UPDATE
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_spreads_delete" ON planner_spreads FOR DELETE
  USING (auth.role() = 'authenticated');

-- B) planner_elements: spread üzerinde overlay öğeleri (x,y,w,h normalize 0..1)
CREATE TABLE IF NOT EXISTS planner_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spread_id UUID NOT NULL REFERENCES planner_spreads(id) ON DELETE CASCADE,
  page_side TEXT NOT NULL CHECK (page_side IN ('left', 'right')),
  type TEXT NOT NULL CHECK (type IN (
    'photo', 'sticky_note', 'washi_tape', 'paperclip', 'sticker',
    'text_block', 'doodle', 'coffee_stain'
  )),
  src TEXT,
  text TEXT,
  x FLOAT NOT NULL CHECK (x >= 0 AND x <= 1),
  y FLOAT NOT NULL CHECK (y >= 0 AND y <= 1),
  w FLOAT NOT NULL CHECK (w >= 0 AND w <= 1) DEFAULT 0.1,
  h FLOAT NOT NULL CHECK (h >= 0 AND h <= 1) DEFAULT 0.1,
  rotation FLOAT NOT NULL DEFAULT 0,
  z_index INT NOT NULL DEFAULT 0,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_planner_elements_spread_id ON planner_elements (spread_id);
CREATE INDEX idx_planner_elements_spread_page ON planner_elements (spread_id, page_side);

ALTER TABLE planner_elements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planner_elements_select" ON planner_elements FOR SELECT USING (true);
CREATE POLICY "planner_elements_insert" ON planner_elements FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_elements_update" ON planner_elements FOR UPDATE
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_elements_delete" ON planner_elements FOR DELETE
  USING (auth.role() = 'authenticated');

-- C) planner_day_entries: günlük kayıt (tarih bazlı, denormalize; responsive için normalize değerler yok)
CREATE TABLE IF NOT EXISTS planner_day_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  title TEXT,
  content TEXT,
  photos TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_planner_day_entries_date ON planner_day_entries (date);

ALTER TABLE planner_day_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planner_day_entries_select" ON planner_day_entries FOR SELECT USING (true);
CREATE POLICY "planner_day_entries_insert" ON planner_day_entries FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_day_entries_update" ON planner_day_entries FOR UPDATE
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_day_entries_delete" ON planner_day_entries FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION set_planner_day_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER planner_day_entries_updated_at
  BEFORE UPDATE ON planner_day_entries
  FOR EACH ROW EXECUTE FUNCTION set_planner_day_entries_updated_at();
