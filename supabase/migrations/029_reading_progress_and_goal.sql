-- İlerleme yüzdesi: "Şu an okuyorum" kitabı için 0-100
ALTER TABLE reading_status
  ADD COLUMN IF NOT EXISTS progress_percent INT CHECK (progress_percent >= 0 AND progress_percent <= 100);

COMMENT ON COLUMN reading_status.progress_percent IS 'Şu an okuyorum kitabı için ilerleme yüzdesi (0-100)';

-- Yıllık hedef: X / Y kitap (okunan / hedef)
CREATE TABLE IF NOT EXISTS reading_goal (
  year INT PRIMARY KEY,
  goal INT NOT NULL DEFAULT 12 CHECK (goal >= 0),
  read_count INT NOT NULL DEFAULT 0 CHECK (read_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE reading_goal IS 'Yıllık okuma hedefi: goal = hedef kitap sayısı, read_count = bu yıl okunan';

ALTER TABLE reading_goal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_reading_goal"
  ON reading_goal FOR SELECT
  USING (true);

CREATE POLICY "admin_all_reading_goal"
  ON reading_goal FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
