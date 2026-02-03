-- Müzikler (Şu an dinliyorum) — admin yönetim
CREATE TABLE IF NOT EXISTS now_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_url TEXT,
  duration_sec INT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE now_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_active_now_tracks"
  ON now_tracks FOR SELECT
  USING (is_active = true);

CREATE POLICY "admin_all_now_tracks"
  ON now_tracks FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
