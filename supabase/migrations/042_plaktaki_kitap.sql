-- Plaktaki Kitap: dedicated settings + items (premium, admin-managed)

-- Singleton settings (one row)
CREATE TABLE IF NOT EXISTS plaktaki_kitap_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intro_text TEXT NOT NULL DEFAULT '',
  youtube_channel_url TEXT NOT NULL DEFAULT '',
  youtube_channel_id TEXT NOT NULL DEFAULT '',
  spotify_profile_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE plaktaki_kitap_settings IS 'Single row: intro, channel URL/ID, Spotify URL for /plaktaki-kitap';

-- Items: videos and audio_books
CREATE TABLE IF NOT EXISTS plaktaki_kitap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('video', 'audio_book')),
  title TEXT NOT NULL DEFAULT '',
  description TEXT,
  youtube_url TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  custom_thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  duration_min INT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE plaktaki_kitap_items IS 'Videolar and Sesli Kitaplar; display: featured first, then order_index asc, then created_at desc';

CREATE INDEX IF NOT EXISTS idx_plaktaki_kitap_items_display
  ON plaktaki_kitap_items (is_featured DESC, order_index ASC, created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_plaktaki_kitap_items_type ON plaktaki_kitap_items (type);

ALTER TABLE plaktaki_kitap_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaktaki_kitap_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plaktaki_kitap_settings_public_select"
  ON plaktaki_kitap_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "plaktaki_kitap_settings_service"
  ON plaktaki_kitap_settings FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "plaktaki_kitap_items_public_select"
  ON plaktaki_kitap_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "plaktaki_kitap_items_service"
  ON plaktaki_kitap_items FOR ALL USING (auth.role() = 'service_role');

-- Seed one settings row if none
INSERT INTO plaktaki_kitap_settings (id, intro_text, youtube_channel_url, youtube_channel_id, spotify_profile_url)
SELECT gen_random_uuid(), '', '', '', NULL
WHERE NOT EXISTS (SELECT 1 FROM plaktaki_kitap_settings LIMIT 1);
