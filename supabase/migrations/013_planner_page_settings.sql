-- Messy bullet journal aesthetic controls
CREATE TABLE IF NOT EXISTS planner_page_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  show_coffee_stain BOOLEAN DEFAULT true,
  show_washi_tape BOOLEAN DEFAULT true,
  show_polaroid BOOLEAN DEFAULT true,
  show_curled_corner BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(year, month)
);

ALTER TABLE planner_page_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "planner_page_settings_select" ON planner_page_settings FOR SELECT USING (true);
CREATE POLICY "planner_page_settings_admin" ON planner_page_settings FOR ALL
  USING (auth.role() = 'authenticated');
