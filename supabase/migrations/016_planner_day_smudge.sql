-- Mürekkep dağılması / leke overlay'i — gün bazlı
CREATE TABLE IF NOT EXISTS planner_day_smudge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  preset TEXT NOT NULL DEFAULT 'smudge_blob'
    CHECK (preset IN ('fingerprint', 'smudge_blob', 'smudge_stain', 'ink_bleed')),
  x FLOAT NOT NULL DEFAULT 0.3 CHECK (x >= 0 AND x <= 1),
  y FLOAT NOT NULL DEFAULT 0.5 CHECK (y >= 0 AND y <= 1),
  rotation FLOAT NOT NULL DEFAULT 0,
  opacity FLOAT NOT NULL DEFAULT 0.15 CHECK (opacity >= 0 AND opacity <= 1),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_planner_day_smudge_date ON planner_day_smudge (date);

ALTER TABLE planner_day_smudge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "planner_day_smudge_select" ON planner_day_smudge FOR SELECT USING (true);
CREATE POLICY "planner_day_smudge_insert" ON planner_day_smudge FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_day_smudge_update" ON planner_day_smudge FOR UPDATE
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "planner_day_smudge_delete" ON planner_day_smudge FOR DELETE
  USING (auth.role() = 'authenticated');
