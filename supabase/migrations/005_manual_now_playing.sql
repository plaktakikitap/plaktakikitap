-- Manuel "Şu an dinliyorum" şarkıları (Spotify bağlı değilken)
CREATE TABLE IF NOT EXISTS manual_now_playing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album_art_url TEXT,
  track_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sadece bir tane aktif olabilsin
CREATE UNIQUE INDEX IF NOT EXISTS idx_manual_now_playing_active
  ON manual_now_playing (is_active) WHERE is_active = true;

-- RLS
ALTER TABLE manual_now_playing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_active_manual_track"
  ON manual_now_playing FOR SELECT
  USING (is_active = true);

CREATE POLICY "admin_all_manual_now_playing"
  ON manual_now_playing FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
